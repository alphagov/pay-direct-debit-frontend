const sinon = require('sinon')
const {expect} = require('chai')
const proxyquire = require('proxyquire')
const paymentFixtures = require('../../../test/fixtures/payments-fixtures')

const GATEWAY_ACCOUNT_ID = 'DIRECT_DEBIT:23823o2iousda'
const SERVICE = paymentFixtures.validService({
  gateway_account_ids: [GATEWAY_ACCOUNT_ID]
})

const setupFixtures = () => {
  const req = {params: {}, correlationId: 'correlation-id'}
  const res = {locals: {}}
  const next = sinon.spy()
  const adminusersClient = {retrieveService: sinon.stub()}
  const renderErrorView = sinon.spy()

  const getService = proxyquire('./get-service', {
    '../../response': {renderErrorView: renderErrorView},
    '../../clients/adminusers-client': adminusersClient
  })

  return {req, res, next, renderErrorView, adminusersClient, getService}
}

describe('Get service middleware', () => {
  describe('when the gateway account id is specified in res.locals', () => {
    describe('and the service can be retrieved from adminusers', () => {
      const {req, res, next, adminusersClient, getService} = setupFixtures()

      before(() => {
        res.locals.gatewayAccountExternalId = GATEWAY_ACCOUNT_ID
        adminusersClient.retrieveService
          .withArgs(GATEWAY_ACCOUNT_ID, req.correlationId)
          .returns(Promise.resolve(SERVICE))
        getService.middleware(req, res, next)
      })

      it('should set the service that has been retrieved in res.locals', () => {
        expect(res.locals).to.have.property('service', SERVICE)
      })

      it('should call the next callback method', () => {
        sinon.assert.calledOn(next)
      })
    })

    describe('and the service can not be retrieved from adminusers', () => {
      let {req, res, next, adminusersClient, renderErrorView, getService} = setupFixtures()

      before(() => {
        res.locals.gatewayAccountExternalId = GATEWAY_ACCOUNT_ID
        adminusersClient.retrieveService
          .withArgs(GATEWAY_ACCOUNT_ID, req.correlationId)
          .returns(Promise.reject(new Error()))
        getService.middleware(req, res, next)
      })

      it('should return an error', () => {
        sinon.assert.calledWith(renderErrorView, req, res)
      })
    })
  })
  describe('when the gateway account id is not specified in res.locals', () => {
    const {req, res, next, renderErrorView, getService} = setupFixtures()

    before(() => {
      getService.middleware(req, res, next)
    })

    it('should return an error', () => {
      sinon.assert.calledWith(renderErrorView, req, res)
    })
  })
})
