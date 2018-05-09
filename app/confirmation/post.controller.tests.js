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
const paymentRequestExternalId = 'sdfihsdufh2e'
const gatewayAccoutExternalId = '1234567890'
const paymentResponse = paymentFixtures.validPaymentResponse({
  external_id: paymentRequestExternalId,
  gateway_account_external_id: gatewayAccoutExternalId
}).getPlain()
const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
  gateway_account_external_id: gatewayAccoutExternalId
})

describe('confirmation POST controller', () => {
  const csrfSecret = '123'
  const csrfToken = csrf().create(csrfSecret)
  const sortCode = '123456'
  const accountNumber = '12345678'
  const payer = paymentFixtures.validPayer({
    account_holder_name: 'payer',
    sort_code: sortCode,
    account_number: accountNumber
  })
  const cookieHeader = new CookieBuilder(
    gatewayAccoutExternalId,
    paymentRequestExternalId
  )
    .withCsrfSecret(csrfSecret)
    .withConfirmationDetails(payer)
    .build()
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when a payment is successfully confirmed', () => {
    before(done => {
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/payment-requests/${paymentRequestExternalId}`)
        .reply(200, paymentResponse)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${gatewayAccoutExternalId}/payment-requests/${paymentRequestExternalId}/confirm`, {
          sort_code: sortCode,
          account_number: accountNumber
        })
        .reply(201)
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      supertest(getApp())
        .post(`/confirmation/${paymentRequestExternalId}`)
        .send({ 'csrfToken': csrfToken })
        .set('cookie', cookieHeader)
        .end((err, res) => {
          response = res
          done(err)
        })
    })

    it('should redirect to /setup', () => {
      expect(response.statusCode).to.equal(303)
    })

    it('should redirect back to the service using its return url', () => {
      const url = paymentResponse.return_url
      expect(response.header).property('location').to.equal(url)
    })
  })

  describe('when failing to confirm a payment', () => {
    before(done => {
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/payment-requests/${paymentRequestExternalId}`)
        .reply(200, paymentResponse)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}/payment-requests/${paymentRequestExternalId}/confirm`, {
          sort_code: sortCode,
          account_number: accountNumber
        })
        .reply(409)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)

      supertest(getApp())
        .post(`/confirmation/${paymentRequestExternalId}`)
        .send({ 'csrfToken': csrfToken })
        .set('cookie', cookieHeader)
        .end((err, res) => {
          response = res
          $ = cheerio.load(res.text || '')
          done(err)
        })
    })

    it('should return a 500', () => {
      expect(response.statusCode).to.equal(500)
    })

    it('should render error page', () => {
      expect($('.heading-large').text()).to.equal('Sorry, we’re experiencing technical problems')
      expect($('#errorMsg').text()).to.equal('No money has been taken from your account, please try again later.')
    })
  })
})
