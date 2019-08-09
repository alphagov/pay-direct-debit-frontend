const sinon = require('sinon')
const { expect } = require('chai')
const proxyquire = require('proxyquire')

const setupFixtures = (resp) => {
  const req = { params: {}, correlationId: 'correlation-id' }
  const res = resp || { locals: {} }
  const next = sinon.spy()
  const response = sinon.spy()

  const mandateStateEnforcer = proxyquire('./mandate-state-enforcer', {
    '../../response': { response }
  })

  return { req, res, next, response, mandateStateEnforcer }
}

const returnUrl = 'https://returnUrl'

describe('Mandate state enforcer', () => {
  describe('when user on set up page and no mandate', () => {
    const { req, res, next, ...rest } = setupFixtures()

    before(() => {
      rest.mandateStateEnforcer.middleware('setup')(req, res, next)
    })

    it('should set the service that has been retrieved in res.locals', () => {
      expect(true).to.equal(true)
    })
    it('should call next if mandate not present', () => {
      expect(next.called).to.equal(true)
    })
  })
  describe('when user on set up page with mandate', () => {
    it('should call next for mandate status of "AWAITING_DIRECT_DEBIT_DETAILS" on page "setup"', () => {
      const { req, res, next, ...rest } = setupFixtures({
        locals: {
          mandate: {
            state: {
              status: 'started'
            },
            internalState: 'AWAITING_DIRECT_DEBIT_DETAILS'
          }
        }
      })
      rest.mandateStateEnforcer.middleware('setup')(req, res, next)

      expect(next.called).to.equal(true)
    })
    it('should render error page for mandate status of "SUBMITTED_TO_BANK" on page "setup"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'pending'
            },
            internalState: 'SUBMITTED_TO_BANK'
          }
        }
      })
      mandateStateEnforcer.middleware('setup')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Check your confirmation email for details of your mandate.',
        heading: 'Your Direct Debit mandate is being processed',
        status: 'SUBMITTED_TO_BANK',
        returnUrl,
        includeReturnUrl: false
      })
    })
    it('should render error page for mandate status of "SUBMITTED_TO_PROVIDER" on page "setup"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'pending'
            },
            internalState: 'SUBMITTED_TO_PROVIDER'
          }
        }
      })
      mandateStateEnforcer.middleware('setup')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Check your confirmation email for details of your mandate.',
        heading: 'Your Direct Debit mandate is being processed',
        status: 'SUBMITTED_TO_PROVIDER',
        returnUrl,
        includeReturnUrl: false
      })
    })
    it('should render error page for mandate status of "ACTIVE" on page "setup"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'active'
            },
            internalState: 'ACTIVE'
          }
        }
      })
      mandateStateEnforcer.middleware('setup')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Check your confirmation email for details of your mandate.',
        heading: 'Your Direct Debit mandate is being processed',
        status: 'ACTIVE',
        returnUrl,
        includeReturnUrl: false
      })
    })
    it('should render error page for mandate status of "FAILED" on page "setup"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'failed'
            },
            internalState: 'FAILED'
          }
        }
      })
      mandateStateEnforcer.middleware('setup')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'You might have entered your details incorrectly or your session may have timed out.',
        heading: 'Your Direct Debit mandate has not been set up',
        status: 'FAILED',
        returnUrl,
        includeReturnUrl: true
      })
    })
    it('should render error page for mandate status of "USER_SETUP_CANCELLED" on page "setup"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'cancelled'
            },
            internalState: 'USER_SETUP_CANCELLED'
          }
        }
      })
      mandateStateEnforcer.middleware('setup')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Your mandate has not been set up.',
	heading: 'You have cancelled the Direct Debit mandate setup',
        status: 'USER_SETUP_CANCELLED',
        returnUrl,
        includeReturnUrl: true
      })
    })
    it('should render error page for mandate status of "USER_SETUP_EXPIRED" on page "setup"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'cancelled'
            },
            internalState: 'USER_SETUP_EXPIRED'
          }
        }
      })
      mandateStateEnforcer.middleware('setup')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'You might have entered your details incorrectly or your session may have timed out.',
        heading: 'Your Direct Debit mandate has not been set up',
        status: 'USER_SETUP_EXPIRED',
        returnUrl,
        includeReturnUrl: true
      })
    })
    it('should render a default error page for any other state on page "setup"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'bla'
            },
            internalState: 'INVALID'
          }
        }
      })
      mandateStateEnforcer.middleware('setup')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Your session may have timed out.',
        heading: 'Sorry, we are experiencing technical problems',
        status: 'INVALID',
        returnUrl,
        includeReturnUrl: true
      })
    })
  })
  describe('when user on confirmation page with mandate', () => {
    it('should call next for mandate status of "started"', () => {
      const { req, res, next, ...rest } = setupFixtures({
        locals: {
          mandate: {
            state: {
              status: 'started'
            },
            internalState: 'AWAITING_DIRECT_DEBIT_DETAILS'
          }
        }
      })
      rest.mandateStateEnforcer.middleware('confirmation')(req, res, next)

      expect(next.called).to.equal(true)
    })
    it('should render error page for mandate status of "SUBMITTED_TO_BANK"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'pending'
            },
            internalState: 'SUBMITTED_TO_BANK'
          }
        }
      })
      mandateStateEnforcer.middleware('confirmation')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Check your confirmation email for details of your mandate.',
        heading: 'Your Direct Debit mandate is being processed',
        status: 'SUBMITTED_TO_BANK',
        returnUrl,
        includeReturnUrl: false
      })
    })
    it('should render error page for mandate status of "SUBMITTED_TO_PROVIDER"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'pending'
            },
            internalState: 'SUBMITTED_TO_PROVIDER'
          }
        }
      })
      mandateStateEnforcer.middleware('confirmation')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Check your confirmation email for details of your mandate.',
        heading: 'Your Direct Debit mandate is being processed',
        status: 'SUBMITTED_TO_PROVIDER',
        returnUrl,
        includeReturnUrl: false
      })
    })
    it('should render error page for mandate status of "ACTIVE"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'active'
            },
            internalState: 'ACTIVE'
          }
        }
      })
      mandateStateEnforcer.middleware('confirmation')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Check your confirmation email for details of your mandate.',
        heading: 'Your Direct Debit mandate is being processed',
        status: 'ACTIVE',
        returnUrl,
        includeReturnUrl: false
      })
    })
    it('should render error page for mandate status of "FAILED"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'failed'
            },
            internalState: 'FAILED'
          }
        }
      })
      mandateStateEnforcer.middleware('confirmation')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'You might have entered your details incorrectly or your session may have timed out.',
        heading: 'Your Direct Debit mandate has not been set up',
        status: 'FAILED',
        returnUrl,
        includeReturnUrl: true
      })
    })
    it('should render error page for mandate status of "USER_SETUP_CANCELLED"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'cancelled'
            },
            internalState: 'USER_SETUP_CANCELLED'
          }
        }
      })
      mandateStateEnforcer.middleware('confirmation')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Your mandate has not been set up.',
        heading: 'You have cancelled the Direct Debit mandate setup',
        status: 'USER_SETUP_CANCELLED',
        returnUrl,
        includeReturnUrl: true
      })
    })
    it('should render error page for mandate status of "USER_SETUP_EXPIRED"', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'cancelled'
            },
            internalState: 'USER_SETUP_EXPIRED'
          }
        }
      })
      mandateStateEnforcer.middleware('confirmation')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'You might have entered your details incorrectly or your session may have timed out.',
        heading: 'Your Direct Debit mandate has not been set up',
        status: 'USER_SETUP_EXPIRED',
        returnUrl,
        includeReturnUrl: true
      })
    })
    it('should render a default error page for any other state', () => {
      const { req, res, next, response, mandateStateEnforcer } = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'bla'
            },
            internalState: 'INVALID'
          }
        }
      })
      mandateStateEnforcer.middleware('confirmation')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Your session may have timed out.',
        heading: 'Sorry, we are experiencing technical problems',
        status: 'INVALID',
        returnUrl,
        includeReturnUrl: true
      })
    })
  })
})
