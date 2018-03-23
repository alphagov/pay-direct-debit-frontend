'use strict'

// npm dependencies
const supertest = require('supertest')
const cheerio = require('cheerio')
const chai = require('chai')
const expect = chai.expect

// Local dependencies
const getApp = require('../../server').getApp

describe('direct debit guarantee controller', () => {
  describe('when requesting guarantee without a charge id', () => {
    let response, $

    before(done => {
      supertest(getApp())
        .get(`/direct-debit-guarantee`)
        .end((err, res) => {
          response = res
          $ = cheerio.load(res.text)
          done(err)
        })
    })

    it('should return a 200 status code', () => {
      expect(response.statusCode).to.equal(200)
    })
    it('should not display back links to the payment journey', () => {
      expect($(`.back`).find('a').attr('href')).to.not.exist // eslint-disable-line no-unused-expressions
      expect($(`.form-group`).find('a').attr('href')).to.not.exist // eslint-disable-line no-unused-expressions
    })
  })
  describe('when requesting guarantee with a charge id', () => {
    const paymentRequestExternalId = 'sdfihsdufh2e'
    let response, $

    before(done => {
      supertest(getApp())
        .get(`/direct-debit-guarantee/${paymentRequestExternalId}`)
        .end((err, res) => {
          response = res
          $ = cheerio.load(res.text)
          done(err)
        })
    })

    it('should return a 200 status code', () => {
      expect(response.statusCode).to.equal(200)
    })
    it('should display back links to the payment journey', () => {
      expect($(`.back`).find('a').attr('href')).to.equal(`/setup/${paymentRequestExternalId}`)
      expect($(`.form-group`).find('a').attr('href')).to.equal(`/setup/${paymentRequestExternalId}`)
    })
  })
})
