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
const mandateFixtures = require('../../test/fixtures/mandate-fixtures')
const { CookieBuilder } = require('../../test/test_helpers/cookie-helper')

describe('confirmation get controller', function () {
  let response, $
  const mandateExternalId = 'sdfihsdufh2e'
  const gatewayAccountExternalId = '1234567890'
  const service = { external_id: 'eisuodfkf',
    name: 'GOV.UK Direct Cake service',
    gateway_account_ids: [gatewayAccountExternalId],
    merchant_details: {
      name: 'Silvia needs coffee',
      address_line1: 'Anywhere',
      address_line2: 'Anyhow',
      address_city: 'London',
      address_postcode: 'AW1H 9UX',
      address_country: 'GB',
      telephone_number: '28398203',
      email: 'bla@bla.test'
    }
  }
  const accountName = 'bla'
  const accountEmail = 'test@test.test'
  const sortCode = '123456'
  const formattedSortCode = '12 34 56'
  const accountNumber = '12345678'

  before(done => {
    const mandateResponse = mandateFixtures.validMandateResponse({
      external_id: mandateExternalId,
      gateway_account_external_id: gatewayAccountExternalId,
      state: {
        status: 'started'
      },
      internal_state: 'AWAITING_DIRECT_DEBIT_DETAILS'
    }).getPlain()
    const gatewayAccountResponse = mandateFixtures.validGatewayAccountResponse({
      gateway_account_external_id: gatewayAccountExternalId
    }).getPlain()
    const payer = mandateFixtures.validPayer({
      account_holder_name: accountName,
      sort_code: sortCode,
      account_number: accountNumber,
      email: accountEmail
    })
    const cookieHeader = new CookieBuilder(
      gatewayAccountExternalId,
      mandateExternalId
    )
      .withCsrfSecret('123')
      .withConfirmationDetails(payer)
      .build()
    nock(config.CONNECTOR_URL)
      .get(`/v1/accounts/${gatewayAccountExternalId}/mandates/${mandateExternalId}`)
      .reply(200, mandateResponse)
    nock(config.CONNECTOR_URL)
      .get(`/v1/api/accounts/${gatewayAccountExternalId}`)
      .reply(200, gatewayAccountResponse)
    nock(config.ADMINUSERS_URL).get(`/v1/api/services?gatewayAccountId=${gatewayAccountExternalId}`).reply(200, service)
    supertest(getApp())
      .get(`/confirmation/${mandateExternalId}`)
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
    expect($('#account-email-address').text()).to.equal(accountEmail)
  })

  it('should display the enter confirmation page with bank statement description', () => {
    expect($(`#bank-statement-description`).text()).to.equal('')
  })

  it('should display the enter direct debit page with a link to cancel the mandate', () => {
    expect($('#cancel').attr('href')).to.equal(`/cancel/${mandateExternalId}`)
  })

  it('should display the confirmation page with a back link to the setup page', () => {
    const url = setup.paths.index.replace(':mandateExternalId', mandateExternalId)
    expect($('.govuk-back-link').attr('href')).to.equal(url)
  })

  it('should display the enter direct debit page with a link to the direct debit guarantee', () => {
    expect($(`.direct-debit-guarantee`).find('a').attr('href')).to.equal(`/direct-debit-guarantee/confirmation/${mandateExternalId}`)
  })
  it('should display merchant details in the footer', () => {
    expect($(`.merchant-details-line-1`).text()).to.equal(`Service provided by ${service.merchant_details.name}`)
    expect($(`.merchant-details-line-2`).text()).to.equal(`${service.merchant_details.address_line1}, ${service.merchant_details.address_line2}, ${service.merchant_details.address_city} ${service.merchant_details.address_postcode} United Kingdom`)
    expect($(`.merchant-details-phone-number`).text()).to.equal(`${service.merchant_details.telephone_number}`)
    expect($(`.merchant-details-email`).text()).to.equal(`${service.merchant_details.email}`)
  })
})

describe('confirmation get controller with no confirmationDetails', function () {
  let response, $
  const mandateExternalId = 'sdfihsdufh2e'
  const gatewayAccoutExternalId = '1234567890'

  before(done => {
    const mandateResponse = mandateFixtures.validMandateResponse({
      external_id: mandateExternalId,
      gateway_account_external_id: gatewayAccoutExternalId,
      state: {
        status: 'started'
      },
      internal_state: 'AWAITING_DIRECT_DEBIT_DETAILS'
    }).getPlain()
    const gatewayAccountResponse = mandateFixtures.validGatewayAccountResponse({
      gateway_account_external_id: gatewayAccoutExternalId
    })
    const cookieHeader = new CookieBuilder(
      gatewayAccoutExternalId,
      mandateExternalId
    )
      .withCsrfSecret('123')
      .build()
    nock(config.CONNECTOR_URL)
      .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
      .reply(200, mandateResponse)
    nock(config.CONNECTOR_URL)
      .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
      .reply(200, gatewayAccountResponse)
    supertest(getApp())
      .get(`/confirmation/${mandateExternalId}`)
      .set('cookie', cookieHeader)
      .end((err, res) => {
        response = res
        $ = cheerio.load(res.text)
        done(err)
      })
  })

  it('should return HTTP 500 status', () => {
    expect(response.statusCode).to.equal(500)
  })

  it('should render error page', () => {
    expect($('.govuk-heading-l').text()).to.equal('Sorry, we’re experiencing technical problems')
    expect($('#errorMsg').text()).to.equal('No money has been taken from your account, please try again later.')
  })
})

describe('confirmation get controller after successful mandate setup', function () {
  let response, $
  const mandateExternalId = 'sdfihsdufh2e'
  const gatewayAccoutExternalId = '1234567890'
  const mandateResponse = mandateFixtures.validMandateResponse({
    external_id: mandateExternalId,
    gateway_account_external_id: gatewayAccoutExternalId,
    state: { status: 'pending' },
    internal_state: 'SUBMITTED'
  }).getPlain()
  const gatewayAccountResponse = mandateFixtures.validGatewayAccountResponse({
    gateway_account_external_id: gatewayAccoutExternalId
  })

  const csrfSecret = '123'
  const sortCode = '123456'
  const accountNumber = '12345678'
  const payer = mandateFixtures.validPayer({
    account_holder_name: 'payer',
    sort_code: sortCode,
    account_number: accountNumber
  })
  const cookieHeader = new CookieBuilder(
    gatewayAccoutExternalId,
    mandateExternalId
  )
    .withCsrfSecret(csrfSecret)
    .withConfirmationDetails(payer)
    .build()
  afterEach(() => {
    nock.cleanAll()
  })

  before(done => {
    nock(config.CONNECTOR_URL)
      .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
      .reply(200, mandateResponse)
    nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
      .reply(200, gatewayAccountResponse)

    supertest(getApp())
      .get(`/confirmation/${mandateExternalId}`)
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

  it('should display the mandate setup completed summary page', () => {
    expect($('form').length).to.equal(0)
    expect($('.govuk-heading-l.SUBMITTED').length).to.equal(1)
  })
})
