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
const paymentRequest = paymentFixtures.validPaymentRequest({
  external_id: paymentRequestExternalId,
  return_url: 'https://returnurl.test'
})

describe('cancel GET controller', () => {
  const csrfSecret = '123'
  const csrfToken = csrf().create(csrfSecret)
  const cookieHeader = new CookieBuilder(paymentRequest)
    .withCsrfSecret(csrfSecret)
    .build()
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when cancelling a payment journey', () => {
    before(done => {
      nock(config.CONNECTOR_URL).post(`/v1/api/accounts/${paymentRequest.gatewayAccountExternalId}/payment-requests/${paymentRequestExternalId}/cancel`).reply(200)
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
      expect($('#return-url').attr('href')).to.equal('https://returnurl.test')
    })
  })
})
