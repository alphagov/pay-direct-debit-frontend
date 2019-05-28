const sinon = require('sinon')
const { expect } = require('chai')
const assert = require('assert')
const proxyquire = require('proxyquire')
const paymentFixtures = require('../../../test/fixtures/payments-fixtures')

const setupFixtures = () => {
  const mandate = paymentFixtures.validMandate()
  const res = { locals: {} }
  const next = sinon.spy()
  const renderErrorView = sinon.spy()

  const checkSecureCookie = proxyquire('./check-secure-cookie', {
    '../../response': { renderErrorView }
  }).middleware

  return { res, next, renderErrorView, mandate, checkSecureCookie }
}

describe('Check secure coookie middleware', function () {
  describe('the mandate external id is valid in session', () => {
    const { res, next, mandate, checkSecureCookie } = setupFixtures()
    const req = {
      params: {
        mandateExternalId: mandate.externalId
      },
      direct_debit_frontend_state: {
        [mandate.externalId]: {
          'mandateExternalId': mandate.externalId,
          'gatewayAccountExternalId': mandate.gatewayAccountExternalId
        }
      }
    }

    before(() => {
      checkSecureCookie(req, res, next)
    })

    it('should set the mandate externalId in res.locals', function () {
      expect(res.locals.mandateExternalId).to.be.equal(mandate.externalId)
    })

    it('should set the gateway account externalId in res.locals', function () {
      expect(res.locals.gatewayAccountExternalId).to.be.equal(mandate.gatewayAccountExternalId)
    })

    it('should call the next callback method', () => {
      assert(next.calledOnce)
    })
  })

  describe('the payment request externalId is not in session', () => {
    const { res, next, renderErrorView, mandate, checkSecureCookie } = setupFixtures()
    const req = {
      params: {
        mandateExternalId: mandate.externalId
      },
      direct_debit_frontend_state: {
        [mandate.externalId]: {}
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
