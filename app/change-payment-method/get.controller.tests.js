'use strict'

// npm dependencies
const chai = require('chai')
const expect = chai.expect
const supertest = require('supertest')
const nock = require('nock')
const csrf = require('csrf')

// Local dependencies
const config = require('../../common/config')
const getApp = require('../../server').getApp
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const {CookieBuilder} = require('../../test/test_helpers/cookie-helper')
let response
const paymentRequestExternalId = 'sdfihsdufh2e123'
const paymentRequest = paymentFixtures.validPaymentRequest({
  external_id: paymentRequestExternalId,
  return_url: '/change-payment-method'
})
const gatewayAccount = paymentFixtures.validGatewayAccount({
  gateway_account_id: paymentRequest.gatewayAccountId,
  gateway_account_external_id: paymentRequest.gatewayAccountExternalId
})

describe('change-payment-method GET controller', () => {
  const csrfSecret = '123'
  const csrfToken = csrf().create(csrfSecret)
  const cookieHeader = new CookieBuilder(paymentRequest)
    .withCsrfSecret(csrfSecret)
    .build()
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when switching payment options', () => {
    before(done => {
      nock(config.CONNECTOR_URL).post(`/v1/api/accounts/${paymentRequest.gatewayAccountExternalId}/payment-requests/${paymentRequestExternalId}/change-payment-method`).reply(200)
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${paymentRequest.gatewayAccountExternalId}`).reply(200, gatewayAccount)
      supertest(getApp())
        .get(`/change-payment-method/${paymentRequestExternalId}`)
        .send({ 'csrfToken': csrfToken })
        .set('cookie', cookieHeader)
        .end((err, res) => {
          response = res
          done(err)
        })
    })

    it('should return HTTP 303 status', () => {
      expect(response.statusCode).to.equal(303)
    })

    it('should redirect to the return url page', () => {
      expect(response.header).property('location').to.equal('/change-payment-method')
    })
  })
})
