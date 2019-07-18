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
const mandateFixtures = require('../../test/fixtures/mandate-fixtures')
const { CookieBuilder } = require('../../test/test_helpers/cookie-helper')

describe('setup get controller', () => {
  let response, $
  const mandateExternalId = 'sdfihsdufh2e'
  const gatewayAccoutExternalId = '1234567890'
  const csrfSecret = '123'
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

  describe('when a mandate is valid', () => {
    const mandateResponse = mandateFixtures.validMandateResponse({
      external_id: mandateExternalId,
      gateway_account_external_id: gatewayAccoutExternalId,
      return_url: `/change-payment-method/${mandateExternalId}`,
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
      .withCsrfSecret(csrfSecret)
      .build()

    before(done => {
      nock(config.CONNECTOR_URL).get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`).reply(200, mandateResponse)
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${gatewayAccoutExternalId}`).reply(200, gatewayAccountResponse)
      nock(config.ADMINUSERS_URL).get(`/v1/api/services?gatewayAccountId=${gatewayAccoutExternalId}`).reply(200, service)
      supertest(getApp())
        .get(`/setup/${mandateExternalId}`)
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

    it('should display the enter direct debit page with a link to the direct debit guarantee', () => {
      expect($(`.direct-debit-guarantee`).find('a').attr('href')).to.equal(`/direct-debit-guarantee/setup/${mandateExternalId}`)
    })

    it('should display the enter direct debit page with a link to cancel the mandate', () => {
      expect($(`.cancel-link`).attr('href')).to.equal(`/cancel/${mandateExternalId}`)
    })

    it('should display the enter direct debit page with a link to go back to a different payment option', () => {
      expect($(`#return-url`).attr('href')).to.equal(`/change-payment-method/${mandateExternalId}`)
    })

    it('should display merchant details in the footer', () => {
      expect($(`.merchant-details-line-1`).text()).to.equal(`Service provided by ${service.merchant_details.name}`)
      expect($(`.merchant-details-line-2`).text()).to.equal(`${service.merchant_details.address_line1}, ${service.merchant_details.address_line2}, ${service.merchant_details.address_city} ${service.merchant_details.address_postcode} United Kingdom`)
      expect($(`.merchant-details-phone-number`).text()).to.equal(`${service.merchant_details.telephone_number}`)
      expect($(`.merchant-details-email`).text()).to.equal(`${service.merchant_details.email}`)
    })
  })
})
