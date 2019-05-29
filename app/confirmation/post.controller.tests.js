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
const { CookieBuilder } = require('../../test/test_helpers/cookie-helper')
let response, $
const mandateExternalId = 'sdfihsdufh2e'
const gatewayAccoutExternalId = '1234567890'
const mandateResponse = paymentFixtures.validOnDemandMandateResponse({
  external_id: mandateExternalId,
  gateway_account_external_id: gatewayAccoutExternalId,
  state: {
    status: 'started'
  },
  internal_state: 'AWAITING_DIRECT_DEBIT_DETAILS'
}).getPlain()
const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
  gateway_account_external_id: gatewayAccoutExternalId
})

describe('confirmation POST controller', () => {
  const csrfSecret = '123'
  const csrfToken = csrf().create(csrfSecret)
  const sortCode = '123456'
  const accountNumber = '12345678'
  const service = { external_id: 'eisuodfkf',
    name: 'GOV.UK Direct Cake service',
    gateway_account_ids: [gatewayAccoutExternalId],
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
  const payer = paymentFixtures.validPayer({
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

  describe('when a payment is successfully confirmed', () => {
    before(done => {
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
        .reply(200, mandateResponse)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/confirm`, {
          sort_code: sortCode,
          account_number: accountNumber
        })
        .reply(201)
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      nock(config.ADMINUSERS_URL).get(`/v1/api/services?gatewayAccountId=${gatewayAccoutExternalId}`).reply(200, service)
      supertest(getApp())
        .post(`/confirmation/${mandateExternalId}`)
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
      const url = mandateResponse.return_url
      expect(response.header).property('location').to.equal(url)
    })
  })

  describe('when failing to confirm a payment', () => {
    before(done => {
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
        .reply(200, mandateResponse)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/confirm`, {
          sort_code: sortCode,
          account_number: accountNumber
        })
        .reply(409)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      nock(config.ADMINUSERS_URL).get(`/v1/api/services?gatewayAccountId=${gatewayAccoutExternalId}`).reply(200, service)
      supertest(getApp())
        .post(`/confirmation/${mandateExternalId}`)
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
      expect($('.govuk-heading-l').text()).to.equal('Sorry, we’re experiencing technical problems')
      expect($('#errorMsg').text()).to.equal('No money has been taken from your account, please try again later.')
    })
    it('should display merchant details in the footer of the error page', () => {
      expect($(`.merchant-details-line-1`).text()).to.equal(`Service provided by ${service.merchant_details.name}`)
      expect($(`.merchant-details-line-2`).text()).to.equal(`${service.merchant_details.address_line1}, ${service.merchant_details.address_line2}, ${service.merchant_details.address_city} ${service.merchant_details.address_postcode} United Kingdom`)
      expect($(`.merchant-details-phone-number`).text()).to.equal(`Phone: ${service.merchant_details.telephone_number}`)
      expect($(`.merchant-details-email`).text()).to.equal(`Email: ${service.merchant_details.email}`)
    })
  })
})
