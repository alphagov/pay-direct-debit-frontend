'use strict'

// npm dependencies
const chai = require('chai')
const expect = chai.expect
const supertest = require('supertest')
const nock = require('nock')
const csrf = require('csrf')

// Local dependencies
const config = require('../../common/config')
const getApp = require('../../server').getApp
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const { CookieBuilder } = require('../../test/test_helpers/cookie-helper')
let response
const mandateExternalId = 'sdfihsdufh2e123'
const gatewayAccoutExternalId = '1234567890'
const returnUrl = '/change-payment-method'
const mandateResponse = paymentFixtures.validOnDemandMandateResponse({
  external_id: mandateExternalId,
  gateway_account_external_id: gatewayAccoutExternalId,
  return_url: returnUrl
}).getPlain()
const gatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
  gateway_account_external_id: gatewayAccoutExternalId
})

describe('change-payment-method GET controller', () => {
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

  describe('when switching payment options', () => {
    before(done => {
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
        .reply(200, mandateResponse)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/change-payment-method`)
        .reply(200)
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      supertest(getApp())
        .get(`/change-payment-method/${mandateExternalId}`)
        .send({ 'csrfToken': csrfToken })
        .set('cookie', cookieHeader)
        .end((err, res) => {
          response = res
          done(err)
        })
    })

    it('should return HTTP 303 status', () => {
      expect(response.statusCode).to.equal(303)
    })

    it('should redirect to the return url page', () => {
      expect(response.header).property('location').to.equal(returnUrl)
    })
  })
})
