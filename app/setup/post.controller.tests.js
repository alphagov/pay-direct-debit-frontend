'use strict'

// npm dependencies
const chai = require('chai')
const expect = chai.expect
const cheerio = require('cheerio')
const supertest = require('supertest')
const nock = require('nock')
const lodash = require('lodash')
const csrf = require('csrf')

// Local dependencies
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const config = require('../../common/config')
const getApp = require('../../server').getApp
const confirmation = require('../confirmation')
const setup = require('../setup')
const {CookieBuilder} = require('../../test/test_helpers/cookie-helper')
const normalise = require('../../common/utils/normalise')

describe('setup post controller', () => {
  let responseRedirect

  afterEach(() => {
    nock.cleanAll()
  })

  describe('when CSRF is not valid', () => {
    let response
    const paymentRequestExternalId = 'sdfihsdufh2ff'
    const paymentRequest = paymentFixtures.validPaymentRequest({
      external_id: paymentRequestExternalId
    })
    before(done => {
      const cookieHeader = new CookieBuilder(paymentRequest)
        .withCsrfSecret('123')
        .build()
      supertest(getApp())
        .post(`/setup/${paymentRequestExternalId}`)
        .send({ 'csrfToken': 'whatever' })
        .set('Cookie', cookieHeader)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
          response = res
          done(err)
        })
    })
    it('should return Bad Request', () => {
      expect(response.statusCode).to.equal(400)
    })
  })
  describe('when submitting the form for a valid payment request', () => {
    const paymentRequestExternalId = 'sdfihsdufh2e'
    const paymentRequest = paymentFixtures.validPaymentRequest({
      external_id: paymentRequestExternalId
    })
    const gatewayAccount = paymentFixtures.validGatewayAccount({
      gateway_account_id: paymentRequest.gatewayAccountId,
      gateway_account_external_id: paymentRequest.gatewayAccountExternalId
    })
    const formValues = paymentFixtures.validPayer()
    const csrfSecret = '123'
    const csrfToken = csrf().create(csrfSecret)
    before(done => {
      const cookieHeader = new CookieBuilder(paymentRequest)
        .withCsrfSecret(csrfSecret)
        .build()
      const createPayerResponse = paymentFixtures.validCreatePayerResponse().getPlain()
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${paymentRequest.gatewayAccountExternalId}`).reply(200, gatewayAccount)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${paymentRequest.gatewayAccountId}/payment-requests/${paymentRequestExternalId}/payers`, {
          account_holder_name: formValues.accountHolderName,
          sort_code: normalise.sortCode(formValues.sortCode),
          account_number: normalise.accountNumber(formValues.accountNumber),
          requires_authorisation: (lodash.isNil(formValues.requiresAuthorisation) || normalise.toBoolean(formValues.requiresAuthorisation)),
          email: formValues.email
        })
        .reply(201, createPayerResponse)
      supertest(getApp())
        .post(`/setup/${paymentRequestExternalId}`)
        .send({ 'csrfToken': csrfToken,
          'account-holder-name': formValues.accountHolderName,
          'sort-code': formValues.sortCode,
          'account-number': formValues.accountNumber,
          'requires-authorisation': formValues.requiresAuthorisation,
          'email': formValues.email
        })
        .set('Cookie', cookieHeader)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
          responseRedirect = res
          done(err)
        })
    })

    it('should redirect to /confirm', () => {
      expect(responseRedirect.statusCode).to.equal(303)
    })

    it('should redirect to the insert direct debit details page', () => {
      const url = confirmation.paths.index.replace(':paymentRequestExternalId', paymentRequestExternalId)
      expect(responseRedirect.header).property('location').to.equal(url)
    })
  })

  describe('should keep the field values when submitting the form with validation errors', () => {
    const paymentRequestExternalId = 'wsfihsdufh2f'
    const paymentRequest = paymentFixtures.validPaymentRequest({
      external_id: paymentRequestExternalId
    })
    const gatewayAccount = paymentFixtures.validGatewayAccount({
      gateway_account_id: paymentRequest.gatewayAccountId,
      gateway_account_external_id: paymentRequest.gatewayAccountExternalId
    })
    const csrfSecret = '123'
    const csrfToken = csrf().create(csrfSecret)
    let cookieHeader, $
    const formValues = {
      accountHolderName: 'Mr T',
      sortCode: '12 34 567',
      accountNumber: '1234567',
      requiresAuthorisation: 'false',
      email: 'payer@example.test'
    }

    before(done => {
      cookieHeader = new CookieBuilder(paymentRequest)
        .withCsrfSecret(csrfSecret)
        .build()
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${paymentRequest.gatewayAccountExternalId}`).reply(200, gatewayAccount)
      supertest(getApp())
        .post(`/setup/${paymentRequestExternalId}`)
        .send({ 'csrfToken': csrfToken,
          'account-holder-name': formValues.accountHolderName,
          'sort-code': formValues.sortCode,
          'account-number': formValues.accountNumber,
          'requires-authorisation': formValues.requiresAuthorisation,
          'email': formValues.email
        })
        .set('Cookie', cookieHeader)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then((res) => {
          responseRedirect = res
        })
        .then(() => {
          supertest(getApp())
            .get(responseRedirect.header['location'])
            .set('cookie', responseRedirect.header['set-cookie'][1])
            .end((err, res) => {
              $ = cheerio.load(res.text)
              done(err)
            })
        }).catch(err => done(err))
    })

    it('should send redirect', () => {
      expect(responseRedirect.statusCode).to.equal(303)
    })

    it('should redirect to the set up direct debit page', () => {
      const url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequestExternalId)
      expect(responseRedirect.header).property('location').to.equal(url)
    })

    it('should contain account holder name pre-filled after redirect', () => {
      expect($('#account-holder-name').val()).to.equal(formValues.accountHolderName)
    })

    it('should contain sort code pre-filled after redirect', () => {
      expect($('#sort-code').val()).to.equal(formValues.sortCode)
    })

    it('should contain account number pre-filled after redirect', () => {
      expect($('#account-number').val()).to.equal(formValues.accountNumber)
    })

    it('should contain email pre-filled after redirect', () => {
      expect($('#email').val()).to.equal(formValues.email)
    })

    it('should contain requires authorisation pre-filled after redirect', () => {
      expect($('#authorise-no').is(':checked')).to.equal(false)
      expect($('#authorise-yes').is(':checked')).to.equal(true)
    })
  })

  describe('Submitting the form with validation errors displays an error summary with respective links', () => {
    const paymentRequestExternalId = 'wsfihsdufh2g'
    let $
    let paymentRequest = paymentFixtures.validPaymentRequest({
      external_id: paymentRequestExternalId
    })
    const gatewayAccount = paymentFixtures.validGatewayAccount({
      gateway_account_id: paymentRequest.gatewayAccountId,
      gateway_account_external_id: paymentRequest.gatewayAccountExternalId
    })
    const csrfSecret = '123'
    const csrfToken = csrf().create(csrfSecret)
    let cookieHeader
    const formValues = {
      accountHolderName: '',
      sortCode: '',
      accountNumber: '',
      requiresAuthorisation: 'true',
      email: ''
    }

    before(done => {
      cookieHeader = new CookieBuilder(paymentRequest)
        .withCsrfSecret(csrfSecret)
        .build()
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${paymentRequest.gatewayAccountExternalId}`).reply(200, gatewayAccount)
      supertest(getApp())
        .post(`/setup/${paymentRequestExternalId}`)
        .send({ 'csrfToken': csrfToken,
          'account-holder-name': formValues.accountHolderName,
          'sort-code': formValues.sortCode,
          'account-number': formValues.accountNumber,
          'requires-authorisation': formValues.requiresAuthorisation,
          'email': formValues.email
        })
        .set('Cookie', cookieHeader)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then((response) => {
          supertest(getApp())
            .get(response.header['location'])
            .set('cookie', response.header['set-cookie'][1])
            .end((err, res) => {
              $ = cheerio.load(res.text)
              done(err)
            })
        })
        .catch((err) => done(err))
    })

    it('should contain expected account holder field as error', () => {
      const errorField = $('.error-account-holder-name')
      expect(errorField.length).to.equal(1)
      expect(errorField.find('a[href="#account-holder-name"]').length).to.equal(1)
    })

    it('should contain expected sort code field as error', () => {
      const errorField = $('.error-sort-code')
      expect(errorField.length).to.equal(1)
      expect(errorField.find('a[href="#sort-code"]').length).to.equal(1)
    })

    it('should contain expected account number field as error', () => {
      const errorField = $('.error-account-number')
      expect(errorField.length).to.equal(1)
      expect(errorField.find('a[href="#account-number"]').length).to.equal(1)
    })

    it('should contain expected email field as error', () => {
      const errorField = $('.error-email')
      expect(errorField.length).to.equal(1)
      expect(errorField.find('a[href="#email"]').length).to.equal(1)
    })

    it('should contain expected requires authorisation field as error', () => {
      const errorField = $('.error-requires-authorisation')
      expect(errorField.length).to.equal(1)
      expect(errorField.find('a[href="#requires-authorisation"]').length).to.equal(1)
    })
  })
})
