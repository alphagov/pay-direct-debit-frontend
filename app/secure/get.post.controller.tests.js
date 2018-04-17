'use strict'

// npm dependencies
const chai = require('chai')
const expect = chai.expect
const supertest = require('supertest')
const cheerio = require('cheerio')
const nock = require('nock')

// Local dependencies
const config = require('../../common/config')
const getApp = require('../../server').getApp
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const setup = require('../setup')
let paymentRequest, validGatewayAccountResponse, response, $

describe('secure controller', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  describe('when getting /secure with a valid one-time token', () => {
    const token = 'sdfihsdufh2e'
    before(done => {
      paymentRequest = paymentFixtures.validTokenExchangeResponse().getPlain()
      validGatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
        gatewayAccountExternalId: paymentRequest.gatewayAccountExternalId
      }).getPlain()
      nock(config.CONNECTOR_URL).get(`/v1/tokens/${token}/payment-request`).reply(200, paymentRequest)
      nock(config.CONNECTOR_URL).delete(`/v1/tokens/${token}`).reply(200)
      nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${paymentRequest.gateway_account_external_id}`)
        .reply(200, validGatewayAccountResponse)
      supertest(getApp())
        .get(`/secure/${token}`)
        .end((err, res) => {
          response = res
          done(err)
        })
    })

    it('should redirect to /setup', () => {
      expect(response.statusCode).to.equal(303)
    })

    it('should redirect to the insert direct debit details page', () => {
      const url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequest.external_id)
      expect(response.header).property('location').to.equal(url)
    })
  })

  describe('when getting /secure with an invalid one-time token', () => {
    before(done => {
      const token = 'invalid'
      nock(config.CONNECTOR_URL).get(`/v1/tokens/${token}/payment-request`).reply(404)
      nock(config.CONNECTOR_URL).delete(`/v1/tokens/${token}`).reply(200)
      supertest(getApp())
        .get(`/secure/${token}`)
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
      expect($('.heading-large').text()).to.equal('Sorry, we’re experiencing technical problems')
      expect($('#errorMsg').text()).to.equal('No money has been taken from your account, please try again later.')
    })

    describe('when posting to /secure with a valid one-time token', () => {
      const token = 'sdfihsdufh2e'

      before(done => {
        paymentRequest = paymentFixtures.validTokenExchangeResponse().getPlain()
        validGatewayAccountResponse = paymentFixtures.validGatewayAccountResponse({
          gatewayAccountExternalId: paymentRequest.gatewayAccountExternalId
        }).getPlain()
        nock(config.CONNECTOR_URL).get(`/v1/tokens/${token}/payment-request`).reply(200, paymentRequest)
        nock(config.CONNECTOR_URL).delete(`/v1/tokens/${token}`).reply(200)
        nock(config.CONNECTOR_URL).get(`/v1/api/accounts/${paymentRequest.gateway_account_external_id}`)
          .reply(200, validGatewayAccountResponse)
        supertest(getApp())
          .post(`/secure`)
          .send({
            chargeTokenId: token
          })
          .end((err, res) => {
            response = res
            done(err)
          })
      })

      it('should redirect to /setup', () => {
        expect(response.statusCode).to.equal(303)
      })

      it('should redirect to the insert direct debit details page', () => {
        const url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequest.external_id)
        expect(response.header).property('location').to.equal(url)
      })
    })

    describe('when posting to /secure with an invalid one-time token', () => {
      before(done => {
        const token = 'invalid'
        nock(config.CONNECTOR_URL).get(`/v1/tokens/${token}/payment-request`).reply(404)
        nock(config.CONNECTOR_URL).delete(`/v1/tokens/${token}`).reply(200)
        supertest(getApp())
          .post(`/secure`)
          .send({
            chargeTokenId: token
          })
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
        expect($('.heading-large').text()).to.equal('Sorry, we’re experiencing technical problems')
        expect($('#errorMsg').text()).to.equal('No money has been taken from your account, please try again later.')
      })
    })
  })
})
