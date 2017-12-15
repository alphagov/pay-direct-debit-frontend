'use strict'

// npm dependencies
const supertest = require('supertest')

// Local dependencies
const getApp = require('../../server').getApp

describe('The /direct-debit-guarantee page', function () {
  it('should return HTTP 200 status', function (done) {
    supertest(getApp())
      .get('/direct-debit-guarantee')
      .expect(200)
      .end(done)
  })
})
