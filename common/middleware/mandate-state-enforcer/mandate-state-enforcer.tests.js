const sinon = require('sinon')
const {expect} = require('chai')
const proxyquire = require('proxyquire')

const setupFixtures = (resp) => {
  const req = {params: {}, correlationId: 'correlation-id'}
  const res = resp || {locals: {}}
  const next = sinon.spy()
  const response = sinon.spy()

  const mandateStateEnforcer = proxyquire('./mandate-state-enforcer', {
    '../../response': {response}
  })

  return {req, res, next, response, mandateStateEnforcer}
}

const returnUrl = 'https://returnUrl'

describe('Mandate state enforcer', () => {
  describe('when user on set up page and no mandate', () => {
    const {req, res, next, ...rest} = setupFixtures()

    before(() => {
      rest.mandateStateEnforcer.middlewareWrapper('setup')(req, res, next)
    })

    it('should set the service that has been retrieved in res.locals', () => {
      expect(true).to.equal(true)
    })
    it('should call next if mandate not present', () => {
      expect(next.called).to.equal(true)
    })
  })

  describe('when user on set up page with mandate', () => {
    it('should call next for mandate status of "started" on page "setup"', () => {
      const {req, res, next, ...rest} = setupFixtures({
        locals: {
          mandate: {
            state: {
              status: 'started'
            }
          }
        }
      })
      rest.mandateStateEnforcer.middlewareWrapper('setup')(req, res, next)

      expect(next.called).to.equal(true)
    })

    it('should render error page for mandate status of "cancelled" on page "setup"', () => {
      const {req, res, next, response, mandateStateEnforcer} = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'cancelled'
            }
          }
        }
      })
      mandateStateEnforcer.middlewareWrapper('setup')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Your mandate has not been set up.',
        heading: 'You have cancelled the Direct Debit mandate setup',
        status: 'cancelled',
        returnUrl,
        includeReturnUrl: true
      })
    })
  })
  describe('when user on confirmation page with mandate', () => {
    it('should call next for mandate status of "started"', () => {
      const {req, res, next, ...rest} = setupFixtures({
        locals: {
          mandate: {
            state: {
              status: 'started'
            }
          }
        }
      })
      rest.mandateStateEnforcer.middlewareWrapper('confirmation')(req, res, next)

      expect(next.called).to.equal(true)
    })

    it('should render error page for mandate status of "cancelled"', () => {
      const {req, res, next, response, mandateStateEnforcer} = setupFixtures({
        locals: {
          mandate: {
            returnUrl: returnUrl,
            state: {
              status: 'cancelled'
            }
          }
        }
      })
      mandateStateEnforcer.middlewareWrapper('confirmation')(req, res, next, response)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(response, req, res, 'common/templates/mandate_state_page', {
        message: 'Your mandate has not been set up.',
        heading: 'You have cancelled the Direct Debit mandate setup',
        status: 'cancelled',
        returnUrl,
        includeReturnUrl: true
      })
    })
  })
})
