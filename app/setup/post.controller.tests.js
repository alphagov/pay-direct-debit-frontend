'use strict'

// npm dependencies
const supertest = require('supertest')

// Local dependencies
const getApp = require('../../server').getApp

describe('POST /setup page', function () {
  it('should return HTTP 302 status and redirect', function (done) {
    supertest(getApp())
      .post('/setup/somepaymentrequest')
      .expect(302)
      .expect('Location', '/confirmation')
      .end(done)
  })
})
