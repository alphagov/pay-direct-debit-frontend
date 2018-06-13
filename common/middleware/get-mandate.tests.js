const sinon = require('sinon')
const {expect} = require('chai')
const proxyquire = require('proxyquire')
const paymentFixtures = require('../../test/fixtures/payments-fixtures')

const MANDATE = paymentFixtures.validMandate()

const setupFixtures = () => {
  const req = {params: {}, correlationId: 'correlation-id'}
  const res = {locals: {}}
  const next = sinon.spy()
  const connectorClient = {secure: {retrievePaymentInformationByExternalId: sinon.stub()}}
  const renderErrorView = sinon.spy()

  const getMandate = proxyquire('./get-mandate', {
    '../response': {renderErrorView: renderErrorView},
    '../clients/connector-client': connectorClient
  })

  return {req, res, next, renderErrorView, connectorClient, getMandate}
}

describe('Get mandate middleware', () => {
  describe('when the mandate external id is not specified in res.locals', () => {
    const {req, res, next, renderErrorView, getMandate} = setupFixtures()

    before(() => {
      res.locals.gatewayAccountExternalId = MANDATE.gatewayAccountExternalId
      getMandate.middleware(req, res, next)
    })

    it('should return an error', () => {
      sinon.assert.calledWith(renderErrorView, req, res)
    })
  })

  describe('when the gateway account external id is not specified in res.locals', () => {
    const {req, res, next, renderErrorView, getMandate} = setupFixtures()

    before(() => {
      res.locals.mandateExternalId = MANDATE.externalId
      getMandate.middleware(req, res, next)
    })

    it('should return an error', () => {
      sinon.assert.calledWith(renderErrorView, req, res)
    })
  })

  describe('when the mandate is specified in res.locals', () => {
    describe('and the mandate can be retrieved from connector', () => {
      const {req, res, next, connectorClient, getMandate} = setupFixtures()

      before(() => {
        res.locals.mandateExternalId = MANDATE.externalId
        res.locals.gatewayAccountExternalId = MANDATE.gatewayAccountExternalId
        connectorClient.secure.retrievePaymentInformationByExternalId
          .withArgs(MANDATE.gatewayAccountExternalId, MANDATE.externalId, undefined, req.correlationId)
          .returns(Promise.resolve(MANDATE))
        getMandate.middleware(req, res, next)
      })

      it('should set the gateway account that has been retrieved in res.locals', () => {
        expect(res.locals).to.have.property('mandate', MANDATE)
      })

      it('should call the next callback method', () => {
        sinon.assert.calledOn(next)
      })
    })
    describe('and the mandate with a transaction can be retrieved from connector', () => {
      const {req, res, next, connectorClient, getMandate} = setupFixtures()
      const transactionExternalId = 'transaction-external-id'
      before(() => {
        res.locals.mandateExternalId = MANDATE.externalId
        res.locals.gatewayAccountExternalId = MANDATE.gatewayAccountExternalId
        res.locals.transactionExternalId = transactionExternalId
        connectorClient.secure.retrievePaymentInformationByExternalId
          .withArgs(MANDATE.gatewayAccountExternalId, MANDATE.externalId, transactionExternalId, req.correlationId)
          .returns(Promise.resolve(MANDATE))
        getMandate.middleware(req, res, next)
      })

      it('should set the gateway account that has been retrieved in res.locals', () => {
        expect(res.locals).to.have.property('mandate', MANDATE)
      })

      it('should call the next callback method', () => {
        sinon.assert.calledOn(next)
      })
    })
    describe('and the mandate can not be retrieved from connector', () => {
      let {req, res, next, connectorClient, renderErrorView, getMandate} = setupFixtures()

      before(() => {
        res.locals.mandateExternalId = MANDATE.externalId
        res.locals.gatewayAccountExternalId = MANDATE.gatewayAccountExternalId
        connectorClient.secure.retrievePaymentInformationByExternalId
          .withArgs(MANDATE.gatewayAccountExternalId, MANDATE.externalId, undefined, req.correlationId)
          .returns(Promise.reject(new Error()))
        getMandate.middleware(req, res, next)
      })

      it('should return an error', () => {
        sinon.assert.calledWith(renderErrorView, req, res)
      })
    })
  })
})
