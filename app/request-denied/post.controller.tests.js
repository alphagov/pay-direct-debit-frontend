'use strict'

// npm dependencies
const chai = require('chai')
const cheerio = require('cheerio')
const expect = chai.expect
const supertest = require('supertest')

// Local dependencies
const getApp = require('../../server').getApp
let response, $
describe('request-denied POST controller', () => {
  describe('when triggered', () => {
    before(done => {
      supertest(getApp())
        .post(`/request-denied`)
        .end((err, res) => {
          response = res
          $ = cheerio.load(res.text || '')
          done(err)
        })
    })

    it('should return HTTP 500 status', () => {
      expect(response.statusCode).to.equal(500)
    })

    it('should show an error page', () => {
      expect($('.heading-large').text()).to.equal('Sorry, we’re experiencing technical problems')
      expect($('#errorMsg').text()).to.equal('No money has been taken from your account, please try again later.')
    })
  })
})
