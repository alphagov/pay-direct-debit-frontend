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
const mandateFixtures = require('../../test/fixtures/mandate-fixtures')
const config = require('../../common/config')
const getApp = require('../../server').getApp
const confirmation = require('../confirmation')
const setup = require('../setup')
const { CookieBuilder } = require('../../test/test_helpers/cookie-helper')
const normalise = require('../../common/utils/normalise')

describe('setup post controller', () => {
  let responseRedirect
  const mandateExternalId = 'sdfihsdufh2e'
  const gatewayAccoutExternalId = '1234567890'
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
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when CSRF is not valid', () => {
    let response
    before(done => {
      const cookieHeader = new CookieBuilder(
        gatewayAccoutExternalId,
        mandateExternalId
      )
        .withCsrfSecret('123')
        .build()
      supertest(getApp())
        .post(`/setup/${mandateExternalId}`)
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
  describe('when submitting the form for a valid mandate request', () => {
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
    const validateBankAccountResponse = {
      is_valid: true,
      bank_name: 'bank name'
    }
    const formValues = mandateFixtures.validPayer()
    const csrfSecret = '123'
    const csrfToken = csrf().create(csrfSecret)
    before(done => {
      const cookieHeader = new CookieBuilder(
        gatewayAccoutExternalId,
        mandateExternalId
      )
        .withCsrfSecret(csrfSecret)
        .build()
      const createPayerResponse = mandateFixtures.validCreatePayerResponse().getPlain()
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
        .reply(200, mandateResponse)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/payers/bank-account/validate`)
        .reply(200, validateBankAccountResponse)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      nock(config.ADMINUSERS_URL).get(`/v1/api/services?gatewayAccountId=${gatewayAccoutExternalId}`).reply(200, service)
      nock(config.CONNECTOR_URL)
        .put(`/v1/api/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/payers`, {
          account_holder_name: formValues.accountHolderName,
          sort_code: normalise.sortCode(formValues.sortCode),
          account_number: normalise.accountNumber(formValues.accountNumber),
          bank_name: 'bank name',
          requires_authorisation: (lodash.isNil(formValues.requiresAuthorisation) || normalise.toBoolean(formValues.requiresAuthorisation)),
          email: formValues.email
        })
        .reply(201, createPayerResponse)
      supertest(getApp())
        .post(`/setup/${mandateExternalId}`)
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
      const url = confirmation.paths.index.replace(':mandateExternalId', mandateExternalId)
      expect(responseRedirect.header).property('location').to.equal(url)
    })
  })

  describe('should keep the field values when submitting the form with validation errors', () => {
    const mandateResponse = mandateFixtures.validMandateResponse({
      external_id: mandateExternalId,
      gateway_account_external_id: gatewayAccoutExternalId,
      state: {
        status: 'started'
      },
      internal_state: 'AWAITING_DIRECT_DEBIT_DETAILS'
    }).getPlain()
    const validateBankAccountResponse = {
      is_valid: true,
      bank_name: 'bank name'
    }
    const gatewayAccountResponse = mandateFixtures.validGatewayAccountResponse({
      gateway_account_external_id: gatewayAccoutExternalId
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
      cookieHeader = new CookieBuilder(
        gatewayAccoutExternalId,
        mandateExternalId
      )
        .withCsrfSecret(csrfSecret)
        .build()
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
        .reply(200, mandateResponse)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/payers/bank-account/validate`)
        .reply(200, validateBankAccountResponse)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      nock(config.ADMINUSERS_URL).get(`/v1/api/services?gatewayAccountId=${gatewayAccoutExternalId}`).reply(200, service)
      supertest(getApp())
        .post(`/setup/${mandateExternalId}`)
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
          nock(config.CONNECTOR_URL)
            .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
            .reply(200, mandateResponse)
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
      const url = setup.paths.index.replace(':mandateExternalId', mandateExternalId)
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
    it('should display merchant details in the footer after redirect', () => {
      expect($(`.merchant-details-line-1`).text()).to.equal(`Service provided by ${service.merchant_details.name}`)
      expect($(`.merchant-details-line-2`).text()).to.equal(`${service.merchant_details.address_line1}, ${service.merchant_details.address_line2}, ${service.merchant_details.address_city} ${service.merchant_details.address_postcode} United Kingdom`)
      expect($(`.merchant-details-phone-number`).text()).to.equal(`Phone: ${service.merchant_details.telephone_number}`)
      expect($(`.merchant-details-email`).text()).to.equal(`Email: ${service.merchant_details.email}`)
    })
  })

  describe('Submitting the form with validation errors displays an error summary with respective links', () => {
    let $
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
    const validateBankAccountResponse = {
      is_valid: true,
      bank_name: 'bank name'
    }
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
      cookieHeader = new CookieBuilder(
        gatewayAccoutExternalId,
        mandateExternalId
      )
        .withCsrfSecret(csrfSecret)
        .build()
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
        .reply(200, mandateResponse)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/payers/bank-account/validate`)
        .reply(200, validateBankAccountResponse)
      nock(config.ADMINUSERS_URL).get(`/v1/api/services?gatewayAccountId=${gatewayAccoutExternalId}`).reply(200, service)
      supertest(getApp())
        .post(`/setup/${mandateExternalId}`)
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
          nock(config.CONNECTOR_URL)
            .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
            .reply(200, mandateResponse)
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
  describe('Submitting the form when bank account validation fails in connector displays an error summary with respective links', () => {
    let $
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
    const validateBankAccountResponse = {
      is_valid: false
    }
    const csrfSecret = '123'
    const csrfToken = csrf().create(csrfSecret)
    let cookieHeader
    const formValues = {
      accountHolderName: '',
      sortCode: '',
      accountNumber: '',
      requiresAuthorisation: 'false',
      email: ''
    }
    before(done => {
      cookieHeader = new CookieBuilder(
        gatewayAccoutExternalId,
        mandateExternalId
      )
        .withCsrfSecret(csrfSecret)
        .build()
      nock(config.CONNECTOR_URL)
        .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
        .reply(200, mandateResponse)
      nock(config.CONNECTOR_URL)
        .get(`/v1/api/accounts/${gatewayAccoutExternalId}`)
        .reply(200, gatewayAccountResponse)
      nock(config.CONNECTOR_URL)
        .post(`/v1/api/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}/payers/bank-account/validate`)
        .reply(200, validateBankAccountResponse)
      nock(config.ADMINUSERS_URL).get(`/v1/api/services?gatewayAccountId=${gatewayAccoutExternalId}`).reply(200, service)
      supertest(getApp())
        .post(`/setup/${mandateExternalId}`)
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
          nock(config.CONNECTOR_URL)
            .get(`/v1/accounts/${gatewayAccoutExternalId}/mandates/${mandateExternalId}`)
            .reply(200, mandateResponse)
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

    it('should contain account holder name pre-filled after redirect', () => {
      expect($('#account-holder-name').val()).to.be.undefined // eslint-disable-line no-unused-expressions
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

    it('should contain an inline error for sort code', () => {
      expect($('label[for="sort-code"]').parent().find('.govuk-error-message').text()).to.contain('Either your sort code or account number is not right')
    })

    it('should contain an inline error for account number', () => {
      expect($('label[for="account-number"]').parent().find('.govuk-error-message').text()).to.contain('Either your sort code or account number is not right')
    })

    it('should contain email pre-filled after redirect', () => {
      expect($('#email').val()).to.be.undefined // eslint-disable-line no-unused-expressions
    })

    it('should contain requires authorisation pre-filled after redirect', () => {
      expect($('#authorise-no').is(':checked')).to.equal(false)
      expect($('#authorise-yes').is(':checked')).to.equal(true)
    })
  })
})
