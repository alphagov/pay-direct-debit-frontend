'use strict'

// npm dependencies
const supertest = require('supertest')
const cheerio = require('cheerio')
const chai = require('chai')
const expect = chai.expect

// Local dependencies
const getApp = require('../../server').getApp
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const {CookieBuilder} = require('../../test/test_helpers/cookie-helper')

describe('setup get controller', () => {
  let response, $
  const paymentRequestExternalId = 'sdfihsdufh2e'
  const amount = 100
  const description = 'please buy Silvia a coffee'
  const csrfSecret = '123'
  describe('when a charge is valid', () => {
    const paymentRequest = paymentFixtures.validPaymentRequest({
      external_id: paymentRequestExternalId,
      amount: amount,
      description: description
    })
    const cookieHeader = new CookieBuilder(paymentRequest)
      .withCsrfSecret(csrfSecret)
      .build()

    before(done => {
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

    it('should display the enter direct debit page with United Kingdom selected by default', () => {
      expect($(`#country-code`).val()).to.equal('GB')
    })

    it('should display the enter direct debit page with a link to the direct debit guarantee', () => {
      expect($(`.direct-debit-guarantee`).find('a').attr('href')).to.equal('/direct-debit-guarantee')
    })
  })
})
