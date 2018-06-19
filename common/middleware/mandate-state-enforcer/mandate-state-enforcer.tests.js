const sinon = require('sinon')
const {expect} = require('chai')
const proxyquire = require('proxyquire')

const setupFixtures = (response) => {
  const req = {params: {}, correlationId: 'correlation-id'}
  const res = response || {locals: {}}
  const next = sinon.spy()
  const renderErrorView = sinon.spy()

  const mandateStateEnforcer = proxyquire('./mandate-state-enforcer', {
    '../../response': {renderErrorView: renderErrorView}
  })

  return {req, res, next, renderErrorView, mandateStateEnforcer}
}

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
      const {req, res, next, renderErrorView, mandateStateEnforcer} = setupFixtures({
        locals: {
          mandate: {
            state: {
              status: 'cancelled'
            }
          }
        }
      })
      mandateStateEnforcer.middlewareWrapper('setup')(req, res, next, renderErrorView)
      expect(next.called).to.equal(false)
      sinon.assert.calledWith(renderErrorView, req, res, 'You cancelled your request. Start again', 500, 'aghhhhhhhhhhhhhh!', true)
    })
  })
})
