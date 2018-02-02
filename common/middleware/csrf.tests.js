const path = require('path')
const sinon = require('sinon')
const assert = require('assert')
const proxyquire = require('proxyquire')

describe.only('CSRF', function () {
  it('should create a CSRF token', function () {
    const verify = sinon.stub()
      .withArgs("it's a secret", 'submitted token')
      .returns(true)

    const create = sinon.stub()
      .withArgs("it's a secret")
      .returns('newly-created token')

    const csrf = proxyquire(path.join(__dirname, '/../../common/middleware/csrf.js'),
      {'csrf': () => {
        return {
          verify: verify,
          create: create
        }
      }
      }).validateAndRefreshCsrf

    const req = {
      route: {methods: {post: {}}},
      session: {csrfSecret: "it's a secret"},
      body: {csrfToken: 'submitted token'}
    }

    const res = {locals: {}}

    const next = sinon.spy()

    csrf(req, res, next)

    assert.equal(res.locals.csrf, 'newly-created token')
    assert(next.calledOnce)
  })

  it('should error if session not present', function () {
    const renderErrorView = sinon.spy()
    const csrf = proxyquire(path.join(__dirname, '/../../common/middleware/csrf.js'), {
      '../response.js': {
        renderErrorView: renderErrorView
      }
    }).validateAndRefreshCsrf

    const req = {
      route: {methods: {post: {}}},
      body: {csrfToken: 'submitted token'}
    }

    const res = {locals: {}}

    const next = sinon.spy()

    csrf(req, res, next)

    sinon.assert.calledWith(renderErrorView, req, res)
  })

  it('should error if session has no CSRF secret', function () {
    const renderErrorView = sinon.spy()
    const csrf = proxyquire(path.join(__dirname, '/../../common/middleware/csrf.js'), {
      '../response.js': {
        renderErrorView: renderErrorView
      }
    }).validateAndRefreshCsrf

    const req = {
      route: {methods: {post: {}}},
      session: {},
      body: {csrfToken: 'submitted token'}
    }

    const res = {locals: {}}

    const next = sinon.spy()

    csrf(req, res, next)

    sinon.assert.calledWith(renderErrorView, req, res)
  })

  it('should error if CSFR token is not valid', function () {
    const renderErrorView = sinon.spy()
    const verify = sinon.stub()
      .withArgs("it's a secret", 'forged token - call the police')
      .returns(false)
    const csrf = proxyquire(path.join(__dirname, '/../../common/middleware/csrf.js'), {
      '../response.js': {
        renderErrorView: renderErrorView
      },
      'csrf': () => {
        return {
          verify: verify
        }
      }
    }).validateAndRefreshCsrf

    const req = {
      route: {methods: {post: {}}},
      session: {csrfSecret: "it's a secret"},
      body: {csrfToken: 'forged token - call the police'}
    }

    const res = {locals: {}}

    const next = sinon.spy()

    csrf(req, res, next)

    sinon.assert.calledWith(renderErrorView, req, res)
  })

  it('should not error if CSRF token is not valid but method is GET', function () {
    const verify = sinon.stub()
      .withArgs("it's a secret", "submitted forged token - but we don't really care")
      .returns(false)

    const create = sinon.stub()
      .withArgs("it's a secret")
      .returns('newly-created token')

    const csrf = proxyquire(path.join(__dirname, '/../../common/middleware/csrf.js'),
      {'csrf': () => {
        return {
          verify: verify,
          create: create
        }
      }
      }).validateAndRefreshCsrf

    const req = {
      method: 'GET',
      session: {csrfSecret: "it's a secret"},
      body: {csrfToken: "submitted forged token - but we don't really care"}
    }

    const res = {locals: {}}

    const next = sinon.spy()

    csrf(req, res, next)

    assert.equal(res.locals.csrf, 'newly-created token')
    assert(next.calledOnce)
  })
})
