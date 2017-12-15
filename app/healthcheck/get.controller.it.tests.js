'use strict'

// npm dependencies
const expect = require('chai').expect
const supertest = require('supertest')

// Local dependencies
const getApp = require('../../server').getApp

describe('The /healthcheck endpoint', function () {
  it('should return HTTP 200 status with expected JSON', function (done) {
    supertest(getApp())
      .get('/healthcheck')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(function (res) {
        const response = JSON.parse(res.text)
        expect(response.ping.healthy).to.equal(true)
      })
      .end(done)
  })
})
