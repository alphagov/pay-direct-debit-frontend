'use strict'

// npm dependencies
const supertest = require('supertest')
const cheerio = require('cheerio')
const chai = require('chai')
const expect = chai.expect
const nock = require('nock')

// Local dependencies
const config = require('../../common/config')
const getApp = require('../../server').getApp
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const {CookieBuilder} = require('../../test/test_helpers/cookie-helper')

describe('setup get controller', () => {
  let response, $
  const paymentRequestExternalId = 'sdfihsdufh2e'
  const gatewayAccoutExternalId = '1234567890'
  const amount = 100
  const description = 'please buy Silvia a coffee'
  const csrfSecret = '123'
  describe('when a charge is valid', () => {
    const paymentResponse = paymentFixtures.validPaymentResponse({
      external_id: paymentRequestExternalId,
      gateway_account_external_id: gatewayAccoutExternalId,
      amount: amount,
      description: description,
      return_url: `/change-payment-method/${paymentRequestExternalId}`
    }).getPlain()
    const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
      gateway_account_external_id: gatewayAccoutExternalId
    })
    const cookieHeader = new CookieBuilder(
      gatewayAccoutExternalId,
      paymentRequestExternalId
    )
      .withCsrfSecret(csrfSecret)
      .build()

    before(done => {
      nock(config.CONNECTOR_URL).get(`/v1/accounts/${gatewayAccoutExternalId}/payment-requests/${paymentRequestExternalId}`).reply(200, paymentResponse)
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${gatewayAccoutExternalId}`).reply(200, gatewayAccountResponse)
      supertest(getApp())
        .get(`/setup/${paymentRequestExternalId}`)
        .set('cookie', cookieHeader)
        .end((err, res) => {
          response = res
          $ = cheerio.load(res.text)
          done(err)
        })
    })

    it('should return a 200 status code', () => {
      expect(response.statusCode).to.equal(200)
    })
    it('should display the enter direct debit page with correct description and amount', () => {
      expect($(`#payment-description`).text()).to.equal(description)
      expect($(`#amount`).text()).to.equal(`£1.00`)
    })

    it('should display the enter direct debit page with a link to the direct debit guarantee', () => {
      expect($(`.direct-debit-guarantee`).find('a').attr('href')).to.equal(`/direct-debit-guarantee/setup/${paymentRequestExternalId}`)
    })

    it('should display the enter direct debit page with a link to cancel the payment', () => {
      expect($(`.cancel-link`).attr('href')).to.equal(`/cancel/${paymentRequestExternalId}`)
    })

    it('should display the enter direct debit page with a link to go back to a different payment option', () => {
      expect($(`#return-url`).attr('href')).to.equal(`/change-payment-method/${paymentRequestExternalId}`)
    })
  })
})
