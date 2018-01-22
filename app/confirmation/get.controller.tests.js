'use strict'

// npm dependencies
const chai = require('chai')
const supertest = require('supertest')
const cheerio = require('cheerio')
const expect = chai.expect

// Local dependencies
const getApp = require('../../server').getApp
const setup = require('../setup')
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const {CookieBuilder} = require('../../test/test_helpers/cookie-helper')
describe('confirmation get controller', function () {
  let response, $
  let paymentRequestExternalId = 'sdfihsdufh2e'
  let accountName = 'bla'
  let sortCode = '123456'
  let accountNumber = '12345678'
  let description = 'this is a description'
  let amount = 1000
  before(done => {
    let paymentRequest = paymentFixtures.validPaymentRequest({
      external_id: paymentRequestExternalId,
      description: description,
      amount: amount
    })
    let payer = paymentFixtures.validPayer({
      account_holder_name: accountName,
      sort_code: sortCode,
      account_number: accountNumber
    })
    const cookieHeader = new CookieBuilder()
      .withPaymentRequest(paymentRequest)
      .withConfirmationDetails(payer)
      .build()
    supertest(getApp())
      .get(`/confirmation/${paymentRequestExternalId}`)
      .set('cookie', cookieHeader)
      .end((err, res) => {
        response = res
        $ = cheerio.load(res.text)
        done(err)
      })
  })
  it('should return HTTP 200 status', () => {
    expect(response.statusCode).to.equal(200)
  })
  it('should display the confirmation page with a back link to the setup page', () => {
    let url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequestExternalId)
    expect($('.link-back').attr('href')).to.equal(url)
  })
  it('should display the confirmation page with the payer details', () => {
    expect($('#account-holder-name').text()).to.equal(accountName)
    expect($('#sort-code').text()).to.equal(sortCode)
    expect($('#account-number').text()).to.equal(accountNumber)
  })
  it('should display the enter confirmation page with correct description and amount', () => {
    expect($(`#payment-description`).text()).to.equal(description)
    expect($(`#amount`).text()).to.equal(`£10.00`)
  })
  it('should display the enter confirmation page with bank statement description', () => {
    expect($(`#bank-statement-description`).text()).to.equal(`'${description}'`)
  })
})
