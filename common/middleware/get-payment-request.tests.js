const path = require('path')
const sinon = require('sinon')
const assert = require('assert')
const proxyquire = require('proxyquire')
const _ = require('lodash')
const paymentFixtures = require('../../test/fixtures/payments-fixtures')

describe('Get payment request middleware', function () {
  it('should retrieve a payment request if present in the session', function () {
    const paymentRequestExternalId = 'asdasdkjshfjdks'
    const returnUrl = 'http://bla.test'
    const gatewayAccountId = 23
    const description = 'description'
    const amount = 124
    const type = 'CHARGE'
    const state = 'SOME_STATE'
    const paymentRequest = paymentFixtures.validPaymentRequest({
      external_id: paymentRequestExternalId,
      return_url: returnUrl,
      gateway_account_id: gatewayAccountId,
      description: description,
      amount: amount,
      type: type,
      state: state
    })
    const req = {
      params: {
        paymentRequestExternalId: paymentRequestExternalId
      },
      direct_debit_frontend_state: {
        [paymentRequestExternalId]: {
          paymentRequest: paymentRequest
        }
      }
    }

    const res = {locals: {}}

    const next = sinon.spy()
    const getPaymentRequest = require('../../common/middleware/get-payment-request').ensureSessionHasPaymentRequest

    getPaymentRequest(req, res, next)
    const paymentRequestInSession = _.get(req, `direct_debit_frontend_state.${paymentRequestExternalId}`).paymentRequest
    assert.equal(res.locals.paymentRequestExternalId, paymentRequestExternalId)
    assert.equal(paymentRequestInSession.externalId, paymentRequestExternalId)
    assert.equal(paymentRequestInSession.returnUrl, returnUrl)
    assert.equal(paymentRequestInSession.gatewayAccountId, gatewayAccountId)
    assert.equal(paymentRequestInSession.description, description)
    assert.equal(paymentRequestInSession.amount, '1.24')
    assert.equal(paymentRequestInSession.type, type)
    assert.equal(paymentRequestInSession.state, state)
    assert(next.calledOnce)
  })

  it('should error if session is not set for payment', function () {
    const req = {
      params: {
        paymentRequestExternalId: 'someexternalid'
      },
      direct_debit_frontend_state: {
        'anotherexternalid': {
          paymentRequest: {}
        }
      }
    }

    const res = {locals: {}}

    const next = sinon.spy()
    const renderErrorView = sinon.spy()
    const getPaymentRequest = proxyquire(path.join(__dirname, '/../../common/middleware/get-payment-request'), {
      '../response': {
        renderErrorView: renderErrorView
      }
    }).ensureSessionHasPaymentRequest
    getPaymentRequest(req, res, next)

    sinon.assert.calledWith(renderErrorView, req, res)
  })

  it('should error if session is set but payment is not in the session', function () {
    const req = {
      params: {
        paymentRequestExternalId: 'someexternalid'
      },
      direct_debit_frontend_state: {
        'someexternalid': {}
      }
    }

    const res = {locals: {}}

    const next = sinon.spy()
    const renderErrorView = sinon.spy()
    const getPaymentRequest = proxyquire(path.join(__dirname, '/../../common/middleware/get-payment-request'), {
      '../response': {
        renderErrorView: renderErrorView
      }
    }).ensureSessionHasPaymentRequest
    getPaymentRequest(req, res, next)

    sinon.assert.calledWith(renderErrorView, req, res)
  })
})
