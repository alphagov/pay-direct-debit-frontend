const sinon = require('sinon')
const {expect} = require('chai')
const proxyquire = require('proxyquire')
const paymentFixtures = require('../../test/fixtures/payments-fixtures')

const PAYMENT_REQUEST = paymentFixtures.validPaymentRequest()

const setupFixtures = () => {
    const req = {params: {}, correlationId: 'correlation-id'}
    const res = {locals: {}}
    const next = sinon.spy()
    const connectorClient = {retrievePaymentRequest: sinon.stub()}
    const renderErrorView = sinon.spy()

    const getPaymentRequest = proxyquire('./get-payment-request', {
      '../response': {renderErrorView: renderErrorView},
      '../clients/connector-client': connectorClient
    })

    return {req, res, next, renderErrorView, connectorClient, getPaymentRequest}
}

describe('Get gateway account middleware', () => {
  describe('when the payment request is not specified in query params', () => {
    const {req, res, next, renderErrorView, getPaymentRequest} = setupFixtures()

    before(() => {
      getPaymentRequest.middleware(req, res, next)
    })

    it('should return an error', () => {
      sinon.assert.calledWith(renderErrorView, req, res)
    })
  })

  describe('when the payment request is specified in the query params', () => {
    describe('and the payment request can be retrieved from connector', () => {
      const {req, res, next, connectorClient, getPaymentRequest} = setupFixtures()

      before(() => {
        req.params.paymentRequestExternalId = PAYMENT_REQUEST.externalId
        connectorClient.retrievePaymentRequest
          .withArgs(PAYMENT_REQUEST.externalId, req.correlationId)
          .returns(Promise.resolve(PAYMENT_REQUEST))
        getPaymentRequest.middleware(req, res, next)
      })

      it('should set the gateway account that has been retrieved in res.locals', () => {
        expect(res.locals).to.have.property('paymentRequest', PAYMENT_REQUEST)
      })

      it('should call the next callback method', () => {
        sinon.assert.calledOn(next)
      })  
    })

    describe('and the payment request can not be retrieved from connector', () => {
      let {req, res, next, connectorClient, renderErrorView, getPaymentRequest} = setupFixtures()

      before(() => {
        req.params.paymentRequestExternalId = PAYMENT_REQUEST.externalId
        connectorClient.retrievePaymentRequest
          .withArgs(PAYMENT_REQUEST.externalId, req.correlationId)
          .returns(Promise.reject(new Error()))
        getPaymentRequest.middleware(req, res, next)
      })

      it('should return an error', () => {
        sinon.assert.calledWith(renderErrorView, req, res)
      })
    })
  })
})
