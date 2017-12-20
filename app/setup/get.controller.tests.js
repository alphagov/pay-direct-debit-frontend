'use strict'

// npm dependencies
const supertest = require('supertest')

// Local dependencies
const getApp = require('../../server').getApp

describe('GET /setup page', function () {
  it('should return HTTP 200 status', function (done) {
    supertest(getApp())
      .get('/setup/somepaymentrequest')
      .expect(200)
      .end(done)
  })
})
