'use strict'

// npm dependencies
const chai = require('chai')
const supertest = require('supertest')
const cheerio = require('cheerio')
const nock = require('nock')
// Local dependencies
const config = require('../../common/config')
const getApp = require('../../server').getApp
const paymentFixtures = require('../../test/fixtures/payments-fixtures')
const setup = require('../setup')
const expect = chai.expect
let paymentRequest, response, $
describe.only('secure controller', () => {
  afterEach(() => {
    nock.cleanAll()
  })
  describe('when navigating to /secure with a valid one-time token', () => {
    let token = 'sdfihsdufh2e'
    before(done => {
      paymentRequest = paymentFixtures.validTokenExchangeResponse().getPlain()
      nock(config.CONNECTOR_URL).get(`/v1/tokens/${token}/charge`).reply(201, paymentRequest)
      supertest(getApp())
        .post(`/secure`)
        .send({
          chargeTokenId: token
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .end((err, res) => {
          response = res
          done(err)
        })
    })
    it('should redirect to /setup', () => {
      expect(response.statusCode).to.equal(303)
    })
    it('should redirect to the insert direct debit details page', () => {
      let url = setup.paths.index.replace(':paymentRequestExternalId', paymentRequest.external_id)
      expect(response.header).property('location').to.equal(url)
    })
  })
  describe('when navigating to /secure with an invalid one-time token', () => {
    before(done => {
      let token = 'invalid'
      nock(config.CONNECTOR_URL).get(`/v1/tokens/${token}/charge`).reply(404)
      supertest(getApp())
        .post(`/secure`)
        .send({
          chargeTokenId: token
        })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
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
