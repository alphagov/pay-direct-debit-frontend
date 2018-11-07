'use strict'

// npm dependencies
const { expect } = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noPreserveCache()

const getCookiesUtil = clientSessionsStub => {
  if (clientSessionsStub) return proxyquire('../../common/config/cookies', { 'client-sessions': clientSessionsStub })
  return proxyquire('../../common/config/cookies', {})
}

describe('cookie configuration', function () {
  describe('when setting the config', function () {
    it('should configure cookie correctly', function () {
      const app = {
        use: sinon.stub()
      }
      const clientSessionsStub = sinon.stub()
      const cookies = getCookiesUtil(clientSessionsStub)

      const expectedConfig = {
        cookieName: 'direct_debit_frontend_state',
        proxy: true,
        duration: 5400000,
        secret: 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk',
        cookie: {
          ephemeral: false,
          httpOnly: true,
          secureProxy: true
        }
      }

      cookies.configureSessionCookie(app)

      expect(clientSessionsStub.calledWith(expectedConfig)).to.equal(true)
    })
    it('should configure two cookies if two session keys are set', function () {
      const SESSION_ENCRYPTION_KEY_2 = process.env.SESSION_ENCRYPTION_KEY_2 = 'bobbobbobbob'
      const app = { use: sinon.spy() }
      const clientSessionsStub = sinon.stub()
      const cookies = getCookiesUtil(clientSessionsStub)

      const expectedConfig1 = {
        cookieName: 'direct_debit_frontend_state',
        proxy: true,
        secret: process.env.SESSION_ENCRYPTION_KEY,
        duration: 5400000,
        cookie: {
          ephemeral: false,
          httpOnly: true,
          secureProxy: true
        }
      }
      const expectedConfig2 = {
        cookieName: 'direct_debit_frontend_state_2',
        proxy: true,
        secret: SESSION_ENCRYPTION_KEY_2,
        duration: 5400000,
        cookie: {
          ephemeral: false,
          httpOnly: true,
          secureProxy: true
        }
      }

      cookies.configureSessionCookie(app)

      expect(clientSessionsStub.calledWith(expectedConfig1)).to.equal(true)
      expect(clientSessionsStub.calledWith(expectedConfig2)).to.equal(true)
      expect(clientSessionsStub.callCount).to.equal(2)
    })
    it('should configure one cookie if one session keys is set', function () {
      process.env.SESSION_ENCRYPTION_KEY_2 = ''
      const app = {
        use: sinon.spy()
      }
      const clientSessionsStub = sinon.stub()
      const cookies = getCookiesUtil(clientSessionsStub)

      const expectedConfig1 = {
        cookieName: 'direct_debit_frontend_state',
        proxy: true,
        duration: 5400000,
        secret: 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk',
        cookie: {
          ephemeral: false,
          httpOnly: true,
          secureProxy: true
        }
      }

      cookies.configureSessionCookie(app)

      expect(clientSessionsStub.calledWith(expectedConfig1)).to.equal(true)
      expect(clientSessionsStub.callCount).to.equal(1)
    })
    it('should throw an error if no session keys are set', function () {
      delete process.env.SESSION_ENCRYPTION_KEY_2
      process.env.SESSION_ENCRYPTION_KEY = ''

      const clientSessionsStub = sinon.stub()
      const cookies = getCookiesUtil(clientSessionsStub)

      expect(() => cookies.configureSessionCookie({})).to.throw(/cookie encryption key is not set/)
    })
    it('should throw an error if no valid session keys are set', function () {
      process.env.SESSION_ENCRYPTION_KEY_2 = 'asfdwv'
      process.env.SESSION_ENCRYPTION_KEY = ''

      const clientSessionsStub = sinon.stub()
      const cookies = getCookiesUtil(clientSessionsStub)

      expect(() => cookies.configureSessionCookie({})).to.throw(/cookie encryption key is not set/)
    })
  })

  describe('when setting value on session', function () {
    it('should set value on direct_debit_frontend_state if SESSION_ENCRYPTION_KEY set', function () {
      process.env.SESSION_ENCRYPTION_KEY = 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk'
      process.env.SESSION_ENCRYPTION_KEY_2 = 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk'
      const cookies = getCookiesUtil()
      const req = {
        direct_debit_frontend_state: {}
      }

      cookies.setSessionVariable(req, 'foo', 'bar')

      expect(req.direct_debit_frontend_state.foo).to.equal('bar')
    })

    it('should set value on direct_debit_frontend_state_2 if SESSION_ENCRYPTION_KEY_2 set', function () {
      const originalKey = process.env.SESSION_ENCRYPTION_KEY
      process.env.SESSION_ENCRYPTION_KEY = ''
      process.env.SESSION_ENCRYPTION_KEY_2 = 'key2key2key2key2'

      const cookies = getCookiesUtil()
      const req = {
        direct_debit_frontend_state_2: {}
      }

      cookies.setSessionVariable(req, 'foo', 'baz')

      expect(req.direct_debit_frontend_state_2.foo).to.equal('baz')

      process.env.SESSION_ENCRYPTION_KEY = originalKey

      delete process.env.SESSION_ENCRYPTION_KEY_2
    })

    it('should set values on direct_debit_frontend_state and direct_debit_frontend_state_2 if both keys set', function () {
      process.env.SESSION_ENCRYPTION_KEY = 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk'
      process.env.SESSION_ENCRYPTION_KEY_2 = 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk'

      const cookies = getCookiesUtil()
      const req = {
        direct_debit_frontend_state: {},
        direct_debit_frontend_state_2: {}
      }

      cookies.setSessionVariable(req, 'foo', 'baz')

      expect(req.direct_debit_frontend_state.foo).to.equal('baz')
      expect(req.direct_debit_frontend_state_2.foo).to.equal('baz')

      delete process.env.SESSION_ENCRYPTION_KEY_2
    })

    it('does not try to set value on non-existent cookie', function () {
      const cookies = getCookiesUtil()
      const req = {}

      cookies.setSessionVariable(req, 'foo', 'bar')

      expect(req).to.deep.equal({})
    })
  })

  describe('getting value from session', function () {
    it('should get value on frontend_state if only SESSION_ENCRYPTION_KEY set', function () {
      process.env.SESSION_ENCRYPTION_KEY = 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk'
      delete process.env.SESSION_ENCRYPTION_KEY_2
      const cookies = getCookiesUtil()
      const req = {
        direct_debit_frontend_state: {
          foo: 'bar'
        }
      }

      expect(cookies.getSessionVariable(req, 'foo')).to.equal('bar')
    })

    it('should get value on frontend_state_2 if only SESSION_ENCRYPTION_KEY_2 set', function () {
      const originalKey = process.env.SESSION_ENCRYPTION_KEY
      delete process.env.SESSION_ENCRYPTION_KEY

      process.env.SESSION_ENCRYPTION_KEY_2 = 'key2key2key2key2'

      const cookies = getCookiesUtil()
      const req = {
        direct_debit_frontend_state_2: {
          foo: 'baz'
        }
      }

      expect(cookies.getSessionVariable(req, 'foo')).to.equal('baz')

      process.env.SESSION_ENCRYPTION_KEY = originalKey
      delete process.env.SESSION_ENCRYPTION_KEY_2
    })

    it('should get value from frontend_state if both keys set', function () {
      process.env.SESSION_ENCRYPTION_KEY = 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk'
      process.env.SESSION_ENCRYPTION_KEY_2 = 'naskjwefvwei72rjkwfmjwfi72rfkjwefmjwefiuwefjkbwfiu24fmjbwfk'

      const cookies = getCookiesUtil()
      const req = {
        direct_debit_frontend_state: {
          foo: 'bar'
        },
        direct_debit_frontend_state_2: {
          foo: 'baz'
        }
      }

      expect(cookies.getSessionVariable(req, 'foo')).to.equal('bar')
    })
  })
})
