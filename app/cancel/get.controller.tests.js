'use strict'

// npm dependencies
const chai = require('chai')
const expect = chai.expect
const supertest = require('supertest')
const cheerio = require('cheerio')
const nock = require('nock')
const csrf = require('csrf')

// Local dependencies
const config = require('../../common/config')
const getApp = require('../../server').getApp
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const {CookieBuilder} = require('../../test/test_helpers/cookie-helper')
let response, $
const paymentRequestExternalId = 'sdfihsdufh2e123'
const gatewayAccoutExternalId = '1234567890'
const returnUrl = '/change-payment-method'
const paymentResponse = paymentFixtures.validPaymentResponse({
  external_id: paymentRequestExternalId,
  gateway_account_external_id: gatewayAccoutExternalId,
  return_url: returnUrl
}).getPlain()
const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
  gateway_account_external_id: gatewayAccoutExternalId
})

describe('cancel GET controller', () => {
  const csrfSecret = '123'
  const csrfToken = csrf().create(csrfSecret)
  const cookieHeader = new CookieBuilder(
    gatewayAccoutExternalId,
    paymentRequestExternalId
  )
    .withCsrfSecret(csrfSecret)
    .build()
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when cancelling a payment journey', () => {
    before(done => {
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/payment-requests/${paymentRequestExternalId}`)
        .reply(200, paymentResponse)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${gatewayAccoutExternalId}/payment-requests/${paymentRequestExternalId}/cancel`)
        .reply(200)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      supertest(getApp())
        .get(`/cancel/${paymentRequestExternalId}`)
        .send({ 'csrfToken': csrfToken })
        .set('cookie', cookieHeader)
        .end((err, res) => {
          response = res
          $ = cheerio.load(res.text || '')
          done(err)
        })
    })

    it('should return HTTP 200 status', () => {
      expect(response.statusCode).to.equal(200)
    })

    it('should display the user cancel page with a back link to the service', () => {
      expect($('#return-url').attr('href')).to.equal(returnUrl)
    })
  })
})
