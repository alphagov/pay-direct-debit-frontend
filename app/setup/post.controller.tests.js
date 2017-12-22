'use strict'

// npm dependencies
const chai = require('chai')
const expect = chai.expect
const supertest = require('supertest')
const nock = require('nock')

// Local dependencies
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const config = require('../../common/config')
const getApp = require('../../server').getApp
const confirmation = require('../confirmation')
const {CookieBuilder} = require('../../test/test_helpers/cookie-helper')

describe('setup post controller', () => {
  let response

  afterEach(() => {
    nock.cleanAll()
  })
  describe('when submitting the form for a valid payment request', () => {
    let paymentRequestExternalId = 'sdfihsdufh2e'
    let paymentRequest = paymentFixtures.validPaymentRequest({
      external_id: paymentRequestExternalId
    })
    let formValues = paymentFixtures.validPayer()
    before(done => {
      const cookieHeader = new CookieBuilder()
        .withPaymentRequest(paymentRequest)
        .build()
      let createPayerResponse = paymentFixtures.validCreatePayerResponse().getPlain()
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${paymentRequest.gatewayAccountId}/payment-requests/${paymentRequestExternalId}/payers`, { account_holder_name: formValues.accountHolderName,
          sort_code: formValues.sortCode,
          account_number: formValues.accountNumber,
          requires_authorisation: formValues.requiresAuthorisation,
          country_code: formValues.country,
          address_line1: formValues.addressLine1,
          address_line2: formValues.addressLine2,
          city: formValues.city,
          postcode: formValues.postcode,
          email: formValues.email })
        .reply(201, createPayerResponse)
      supertest(getApp())
        .post(`/setup/${paymentRequestExternalId}`)
        .send({ 'account-holder-name': formValues.accountHolderName,
          'sort-code': formValues.sortCode,
          'account-number': formValues.accountNumber,
          'requires-authorisation': formValues.requiresAuthorisation,
          'country-code': formValues.country,
          'address-line1': formValues.addressLine1,
          'address-line2': formValues.addressLine2,
          'city': formValues.city,
          'postcode': formValues.postcode,
          'email': formValues.email })
        .set('Cookie', cookieHeader)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
          response = res
          done(err)
        })
    })
    it('should redirect to /confirm', () => {
      expect(response.statusCode).to.equal(303)
    })
    it('should redirect to the insert direct debit details page', () => {
      let url = confirmation.paths.index.replace(':paymentRequestExternalId', paymentRequestExternalId)
      expect(response.header).property('location').to.equal(url)
    })
  })
})
