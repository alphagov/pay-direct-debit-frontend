const sinon = require('sinon')
const {expect} = require('chai')
const proxyquire = require('proxyquire')
const paymentFixtures = require('../../test/fixtures/payments-fixtures')

const PAYMENT_REQUEST = paymentFixtures.validPaymentRequest()
const GATEWAY_ACCOUNT = paymentFixtures.validGatewayAccount({
  gateway_account_id: PAYMENT_REQUEST.gatewayAccountId,
  gateway_account_external_id: PAYMENT_REQUEST.gatewayAccountExternalId
})

const setup = () => {
  const fixtures = {
    req: {res: {locals: {}}, correlationId: 'correlation-id'},
    res: {locals: {}},
    next: sinon.spy(),
    cache: { get: sinon.stub(), put: sinon.spy() },
    connectorClient: {retrieveGatewayAccount: sinon.stub()},
    renderErrorView: sinon.spy()
  }

  const getGatewayAccount = proxyquire('./get-gateway-account', {
    '../response': {renderErrorView: fixtures.renderErrorView},
    'memory-cache': { Cache: function () { return fixtures.cache } },
    '../clients/connector-client': fixtures.connectorClient
  })

  return Object.assign(fixtures, {getGatewayAccount})
}

describe('Get gateway account middleware', () => {
  describe('when the payment request is not found in res.locals', () => {
    const {req, res, next, renderErrorView, getGatewayAccount} = setup()

    before(() => {
      getGatewayAccount.middleware(req, res, next)
    })

    it('should return an error', () => {
      sinon.assert.calledWith(renderErrorView, req, res)
    })
  })

  describe('when the gateway account is cached', () => {
    const {req, res, next, cache, getGatewayAccount} = setup()

    before(() => {
      req.res.locals = {paymentRequest: PAYMENT_REQUEST}
      cache.get.withArgs(PAYMENT_REQUEST.gatewayAccountExternalId).returns(GATEWAY_ACCOUNT)
      getGatewayAccount.middleware(req, res, next)
    })

    it('should set the cached gateway account in res.locals', () => {
      expect(res.locals).to.have.property('gatewayAccount', GATEWAY_ACCOUNT)
    })

    it('should call the next callback method', () => {
      sinon.assert.calledOn(next)
    })
  })

  describe('when the gateway account is not cached', () => {
    describe('and the gateway account can be retrieved from connector', () => {
      const {req, res, next, cache, connectorClient, getGatewayAccount} = setup()

      before(() => {
        req.res.locals = {paymentRequest: PAYMENT_REQUEST}
        connectorClient.retrieveGatewayAccount
          .withArgs(PAYMENT_REQUEST.gatewayAccountExternalId, req.correlationId)
          .returns(Promise.resolve(GATEWAY_ACCOUNT))
        getGatewayAccount.middleware(req, res, next)
      })

      it('should cache the gateway account', () => {
        sinon.assert.calledWith(cache.put, PAYMENT_REQUEST.gatewayAccountExternalId, GATEWAY_ACCOUNT, getGatewayAccount.CACHE_MAX_AGE)
      })

      it('should set the gateway account that has been retrieved in res.locals', () => {
        expect(res.locals).to.have.property('gatewayAccount', GATEWAY_ACCOUNT)
      })

      it('should call the next callback method', () => {
        sinon.assert.calledOn(next)
      })
    })

    describe('and the gateway account can not be retrieved from connector', () => {
      let {req, res, next, connectorClient, renderErrorView, getGatewayAccount} = setup()

      before(() => {
        req.res.locals = {paymentRequest: PAYMENT_REQUEST}
        connectorClient.retrieveGatewayAccount
          .withArgs(PAYMENT_REQUEST.gatewayAccountExternalId, req.correlationId)
          .returns(Promise.reject(new Error()))
        getGatewayAccount.middleware(req, res, next)
      })

      it('should return an error', () => {
        sinon.assert.calledWith(renderErrorView, req, res)
      })
    })
  })
})
