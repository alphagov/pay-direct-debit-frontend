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
const mandateExternalId = 'sdfihsdufh2e123'
const gatewayAccoutExternalId = '1234567890'
const returnUrl = '/change-payment-method'
const mandateResponse = paymentFixtures.validOnDemandMandateResponse({
  external_id: mandateExternalId,
  gateway_account_external_id: gatewayAccoutExternalId,
  return_url: returnUrl,
  state: {
    status: 'started'
  },
  internal_state: 'AWAITING_DIRECT_DEBIT_DETAILS'
}).getPlain()
const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
  gateway_account_external_id: gatewayAccoutExternalId
})

describe('cancel GET controller', () => {
  const service = { external_id: 'eisuodfkf',
    service_name: {
      en: 'GOV.UK Direct Cake service'
    },
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
  const csrfSecret = '123'
  const csrfToken = csrf().create(csrfSecret)
  const cookieHeader = new CookieBuilder(
    gatewayAccoutExternalId,
    mandateExternalId
  )
    .withCsrfSecret(csrfSecret)
    .build()
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when cancelling a payment journey', () => {
    before(done => {
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
        .reply(200, mandateResponse)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/cancel`)
        .reply(200)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      nock(config.ADMINUSERS_URL).get(`/v1/api/services?gatewayAccountId=${gatewayAccoutExternalId}`).reply(200, service)

      supertest(getApp())
        .get(`/cancel/${mandateExternalId}`)
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

    it('should display merchant details in the footer', () => {
      expect($(`.merchant-details-line-1`).text()).to.equal(`Service provided by ${service.merchant_details.name}`)
      expect($(`.merchant-details-line-2`).text()).to.contain(`${service.merchant_details.address_line1}, ${service.merchant_details.address_line2}, ${service.merchant_details.address_city} ${service.merchant_details.address_postcode} United Kingdom`)
      expect($(`.merchant-details-phone-number`).text()).to.equal(`Phone: ${service.merchant_details.telephone_number}`)
      expect($(`.merchant-details-email`).text()).to.equal(`Email: ${service.merchant_details.email}`)
    })
  })
})
