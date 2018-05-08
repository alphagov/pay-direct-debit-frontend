const sinon = require('sinon')
const {expect} = require('chai')
const assert = require('assert')
const proxyquire = require('proxyquire')
const paymentFixtures = require('../../test/fixtures/payments-fixtures')

const setupFixtures = () => {
  const paymentRequest = paymentFixtures.validPaymentRequest()
  const res = {locals: {}}
  const next = sinon.spy()
  const renderErrorView = sinon.spy()

  const checkSecureCookie = proxyquire('./check-secure-cookie', {
    '../response': {renderErrorView}
  }).middleware

  return {res, next, renderErrorView, paymentRequest, checkSecureCookie}
}

describe('Check secure coookie middleware', function () {
  describe('the payment request externalId is valid in session', () => {
    const {res, next, paymentRequest, checkSecureCookie} = setupFixtures()
    const req = {
      params: {
        paymentRequestExternalId: paymentRequest.externalId
      },
      direct_debit_frontend_state: {
        [paymentRequest.externalId]: {
          'paymentRequestExternalId': paymentRequest.externalId,
          'gatewayAccountExternalId': paymentRequest.gatewayAccountExternalId
        }
      }
    }

    before(() => {
      checkSecureCookie(req, res, next)
    })

    it('should set the payment request externalId in res.locals', function () {
      expect(res.locals.paymentRequestExternalId).to.be.equal(paymentRequest.externalId)
    })

    it('should set the gateway account externalId in res.locals', function () {
      expect(res.locals.gatewayAccountExternalId).to.be.equal(paymentRequest.gatewayAccountExternalId)
    })

    it('should call the next callback method', () => {
      assert(next.calledOnce)
    })
  })

  describe('the payment request externalId is not in session', () => {
    const {res, next, renderErrorView, paymentRequest, checkSecureCookie} = setupFixtures()
    const req = {
      params: {
        paymentRequestExternalId: paymentRequest.externalId
      },
      direct_debit_frontend_state: {
        [paymentRequest.externalId]: {}
      }
    }

    before(() => {
      checkSecureCookie(req, res, next)
    })

    it('should error', function () {
      sinon.assert.calledWith(renderErrorView, req, res)
    })
  })
})
