'use strict'

// npm dependencies
const chai = require('chai')
const supertest = require('supertest')
const cheerio = require('cheerio')
const expect = chai.expect
const nock = require('nock')

// Local dependencies
const setup = require('../setup')
const config = require('../../common/config')
const getApp = require('../../server').getApp
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const {CookieBuilder} = require('../../test/test_helpers/cookie-helper')

describe('confirmation get controller', function () {
  let response, $
  const paymentRequestExternalId = 'sdfihsdufh2e'
  const gatewayAccoutExternalId = '1234567890'
  const accountName = 'bla'
  const sortCode = '123456'
  const formattedSortCode = '12 34 56'
  const accountNumber = '12345678'
  const description = 'this is a description'
  const amount = 1000

  before(done => {
    const paymentResponse = paymentFixtures.validPaymentResponse({
      external_id: paymentRequestExternalId,
      gateway_account_external_id: gatewayAccoutExternalId,
      amount: amount,
      description: description
    }).getPlain()
    const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
      gateway_account_external_id: gatewayAccoutExternalId
    })
    const payer = paymentFixtures.validPayer({
      account_holder_name: accountName,
      sort_code: sortCode,
      account_number: accountNumber
    })
    const cookieHeader = new CookieBuilder(
      gatewayAccoutExternalId,
      paymentRequestExternalId
    )
      .withCsrfSecret('123')
      .withConfirmationDetails(payer)
      .build()
    nock(config.CONNECTOR_URL)
      .get(`/v1/accounts/${gatewayAccoutExternalId}/payment-requests/${paymentRequestExternalId}`)
      .reply(200, paymentResponse)
    nock(config.CONNECTOR_URL)
      .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
      .reply(200, gatewayAccountResponse)
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

  it('should display the confirmation page with the payer details', () => {
    expect($('#account-holder-name').text()).to.equal(accountName)
    expect($('#sort-code').text()).to.equal(formattedSortCode)
    expect($('#account-number').text()).to.equal(accountNumber)
  })

  it('should display the enter confirmation page with correct description and amount', () => {
    expect($(`#payment-description`).text()).to.equal(description)
    expect($(`#amount`).text()).to.equal(`£10.00`)
  })

  it('should display the enter confirmation page with bank statement description', () => {
    expect($(`#bank-statement-description`).text()).to.equal(`'${description}'`)
  })

  it('should display the enter direct debit page with a link to cancel the payment', () => {
    expect($(`.cancel-link`).attr('href')).to.equal(`/cancel/${paymentRequestExternalId}`)
  })

  it('should display the confirmation page with a back link to the setup page', () => {
    const url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequestExternalId)
    expect($('.link-back').attr('href')).to.equal(url)
  })
  it('should display the enter direct debit page with a link to the direct debit guarantee', () => {
    expect($(`.direct-debit-guarantee`).find('a').attr('href')).to.equal(`/direct-debit-guarantee/confirmation/${paymentRequestExternalId}`)
  })
})
