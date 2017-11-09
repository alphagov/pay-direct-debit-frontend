const path = require('path')
const expect = require('chai').expect
const request = require('supertest')
const getApp = require(path.join(__dirname, '/../../server.js')).getApp

describe('The /healthcheck endpoint', function () {
  it('should return 200 with expected json', function (done) {
    request(getApp())
      .get('/healthcheck')
      .set('Accept', 'application/json')
      .expect(200)
      .expect(function (res) {
        const response = JSON.parse(res.text)
        expect(response.ping.healthy).to.equal(true)
      }).end(done)
  })
})
