'use strict'

// Node.js core dependencies
const path = require('path')

// npm dependencies
const supertest = require('supertest')

// Local dependencies
const getApp = require(path.join(__dirname, '/../../server.js')).getApp

describe('The / page', function () {
  it('should return HTTP 200 status', function (done) {
    supertest(getApp())
      .get('/')
      .expect(200)
      .end(done)
  })
})
