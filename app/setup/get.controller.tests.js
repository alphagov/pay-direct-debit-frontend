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
const { CookieBuilder } = require('../../test/test_helpers/cookie-helper')

describe('setup get controller', () => {
  let response, $
  const mandateExternalId = 'sdfihsdufh2e'
  const gatewayAccoutExternalId = '1234567890'
  const transactionExternalId = 'osdhfsdkgjyfffsdj'
  const amount = 100
  const description = 'please buy Silvia a coffee'
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

  describe('when a one-off mandate is valid', () => {
    const mandateResponse = paymentFixtures.validOneOffMandateResponse({
      external_id: mandateExternalId,
      gateway_account_external_id: gatewayAccoutExternalId,
      transaction_external_id: transactionExternalId,
      transaction: {
        external_id: transactionExternalId,
        amount: amount,
        description: description
      },
      return_url: `/change-payment-method/${mandateExternalId}`,
      state: {
        status: 'started'
      },
      internal_state: 'AWAITING_DIRECT_DEBIT_DETAILS'
    }).getPlain()
    const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
      gateway_account_external_id: gatewayAccoutExternalId
    })
    const cookieHeader = new CookieBuilder(
      gatewayAccoutExternalId,
      mandateExternalId,
      transactionExternalId
    )
      .withCsrfSecret(csrfSecret)
      .build()

    before(done => {
      nock(config.CONNECTOR_URL).get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/payments/${transactionExternalId}`).reply(200, mandateResponse)
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
    it('should display the enter direct debit page with correct description and amount', () => {
      expect($(`#payment-description`).text()).to.equal(description)
      expect($(`#amount`).text()).to.equal(`£1.00`)
    })

    it('should display the enter direct debit page with a link to the direct debit guarantee', () => {
      expect($(`.direct-debit-guarantee`).find('a').attr('href')).to.equal(`/direct-debit-guarantee/setup/${mandateExternalId}`)
    })

    it('should display the enter direct debit page with a link to cancel the payment', () => {
      expect($(`.cancel-link`).attr('href')).to.equal(`/cancel/${mandateExternalId}`)
    })

    it('should display the enter direct debit page with a link to go back to a different payment option', () => {
      expect($(`#return-url`).attr('href')).to.equal(`/change-payment-method/${mandateExternalId}`)
    })

    it('should display merchant details in the footer', () => {
      expect($(`.merchant-details-line-1`).text()).to.equal(`Service provided by ${service.merchant_details.name}`)
      expect($(`.merchant-details-line-2`).text()).to.equal(`${service.merchant_details.address_line1}, ${service.merchant_details.address_line2}, ${service.merchant_details.address_city} ${service.merchant_details.address_postcode} United Kingdom`)
      expect($(`.merchant-details-phone-number`).text()).to.equal(`Phone: ${service.merchant_details.telephone_number}`)
      expect($(`.merchant-details-email`).text()).to.equal(`Email: ${service.merchant_details.email}`)
    })
  })

  describe('when a one-off mandate is valid and it has a payer', () => {
    const payer = { payer_external_id: 'eg042u',
      account_holder_name: 'mr. payment',
      email: 'user@example.test',
      requires_authorisation: 'false' }
    const mandateResponse = paymentFixtures.validOneOffMandateResponse({
      external_id: mandateExternalId,
      gateway_account_external_id: gatewayAccoutExternalId,
      transaction_external_id: transactionExternalId,
      transaction: {
        external_id: transactionExternalId,
        amount: amount,
        description: description
      },
      return_url: `/change-payment-method/${mandateExternalId}`,
      payer: payer,
      state: {
        status: 'started'
      },
      internal_state: 'AWAITING_DIRECT_DEBIT_DETAILS'
    }).getPlain()
    const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
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
    it('should display the enter direct debit page with prefilled form', () => {
      expect($('#account-holder-name').val()).to.equal(payer.account_holder_name)
      expect($('#email').val()).to.equal(payer.email)
      expect($('#authorise-no').is(':checked')).to.equal(payer.requires_authorisation === 'true')
      expect($('#authorise-yes').is(':checked')).to.equal(payer.requires_authorisation === 'false')
    })
    it('should display merchant details in the footer', () => {
      expect($(`.merchant-details-line-1`).text()).to.equal(`Service provided by ${service.merchant_details.name}`)
      expect($(`.merchant-details-line-2`).text()).to.equal(`${service.merchant_details.address_line1}, ${service.merchant_details.address_line2}, ${service.merchant_details.address_city} ${service.merchant_details.address_postcode} United Kingdom`)
      expect($(`.merchant-details-phone-number`).text()).to.equal(`Phone: ${service.merchant_details.telephone_number}`)
      expect($(`.merchant-details-email`).text()).to.equal(`Email: ${service.merchant_details.email}`)
    })
  })

  describe('when a on-demand mandate is valid', () => {
    const mandateResponse = paymentFixtures.validOnDemandMandateResponse({
      external_id: mandateExternalId,
      gateway_account_external_id: gatewayAccoutExternalId,
      return_url: `/change-payment-method/${mandateExternalId}`,
      state: {
        status: 'started'
      },
      internal_state: 'AWAITING_DIRECT_DEBIT_DETAILS'
    }).getPlain()
    const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
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
    it('should display the enter direct debit page with correct description and amount', () => {
      expect($(`#payment-description`).text()).to.equal('')
      expect($(`#amount`).text()).to.equal('')
    })

    it('should display the enter direct debit page with a link to the direct debit guarantee', () => {
      expect($(`.direct-debit-guarantee`).find('a').attr('href')).to.equal(`/direct-debit-guarantee/setup/${mandateExternalId}`)
    })

    it('should display the enter direct debit page with a link to cancel the payment', () => {
      expect($(`.cancel-link`).attr('href')).to.equal(`/cancel/${mandateExternalId}`)
    })

    it('should display the enter direct debit page with a link to go back to a different payment option', () => {
      expect($(`#return-url`).attr('href')).to.equal(`/change-payment-method/${mandateExternalId}`)
    })

    it('should display merchant details in the footer', () => {
      expect($(`.merchant-details-line-1`).text()).to.equal(`Service provided by ${service.merchant_details.name}`)
      expect($(`.merchant-details-line-2`).text()).to.equal(`${service.merchant_details.address_line1}, ${service.merchant_details.address_line2}, ${service.merchant_details.address_city} ${service.merchant_details.address_postcode} United Kingdom`)
      expect($(`.merchant-details-phone-number`).text()).to.equal(`Phone: ${service.merchant_details.telephone_number}`)
      expect($(`.merchant-details-email`).text()).to.equal(`Email: ${service.merchant_details.email}`)
    })
  })
})
