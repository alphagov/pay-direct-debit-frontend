// npm dependencies
const _ = require('lodash')
const logger = require('pino')()

// local dependencies
const {response} = require('../../response')

const pageToValidMandateStateMap = {
  'setup': ['started'],
  'confirmation': ['started'],
  'cancel': ['started']
}

const mandateStateToMessageMap = {
  cancelled: {
    heading: 'You have cancelled the Direct Debit mandate setup',
    message: 'Your mandate has not been set up.',
    includeReturnUrl: true
  },
  inactive: {
    heading: 'You have cancelled the Direct Debit mandate setup',
    message: 'Your mandate has not been set up.',
    includeReturnUrl: true
  },
  pending: {
    heading: 'Your Direct Debit mandate is being processed',
    message: 'Check your confirmation email for details of your mandate.  '
  },
  failed: {
    heading: 'Your Direct Debit mandate has not been set up',
    message: 'You might have entered your details incorrectly or your session may have timed out.',
    includeReturnUrl: true
  },
  active: {
    heading: 'Your Direct Debit mandate has been set up',
    message: 'We have sent you a confirmation email with your mandate details. '
  },

  default: {
    heading: 'Sorry, we are experiencing technical problems',
    message: '',
    includeReturnUrl: true
  }
}

function middlewareWrapper (page) {
  return (req, res, next) => {
    const mandate = _.get(res, 'locals.mandate')
    if (mandate) {
      const mandateState = _.get(mandate, 'state.status')
      const stateIsAllowed = pageToValidMandateStateMap[page].includes(mandateState)

      if (stateIsAllowed) {
        next()
      } else {
        const content = _.get(mandateStateToMessageMap, mandateState, mandateStateToMessageMap.default)
        logger.info(`[${req.correlationId}] Mandate ${mandate.externalId} is in state ${mandateState} and not valid for page ${page}`)
        response(req, res, 'common/templates/mandate_state_page', {
          message: content.message,
          heading: content.heading,
          returnUrl: mandate.returnUrl,
          status: mandateState,
          includeReturnUrl: content.includeReturnUrl
        })
      }
    } else {
      next()
    }
  }
}

module.exports = {
  middlewareWrapper
}
