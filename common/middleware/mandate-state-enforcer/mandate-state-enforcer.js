// npm dependencies
const _ = require('lodash')
const logger = require('pino')()

// local dependencies
const { response } = require('../../response')

const pageToValidMandateStateMap = {
  'setup': ['AWAITING_DIRECT_DEBIT_DETAILS'],
  'confirmation': ['AWAITING_DIRECT_DEBIT_DETAILS'],
  'cancel': ['AWAITING_DIRECT_DEBIT_DETAILS']
}

const mandateStateToMessageMap = {
  USER_CANCEL_NOT_ELIGIBLE: {
    heading: 'You have cancelled the Direct Debit mandate setup',
    message: 'Your mandate has not been set up.',
    includeReturnUrl: true
  },
  SUBMITTED: {
    heading: 'Your Direct Debit mandate is being processed',
    message: 'Check your confirmation email for details of your mandate.',
    includeReturnUrl: false
  },
  PENDING: {
    heading: 'Your Direct Debit mandate is being processed',
    message: 'Check your confirmation email for details of your mandate.',
    includeReturnUrl: false
  },
  FAILED: {
    heading: 'Your Direct Debit mandate has not been set up',
    message: 'You might have entered your details incorrectly or your session may have timed out.',
    includeReturnUrl: true
  },
  ACTIVE: {
    heading: 'Your Direct Debit mandate has been set up',
    message: 'We have sent you a confirmation email with your mandate details.',
    includeReturnUrl: false
  },
  EXPIRED: {
    heading: 'Your Direct Debit mandate has not been set up',
    message: 'You might have entered your details incorrectly or your session may have timed out.',
    includeReturnUrl: true
  },
  default: {
    heading: 'Sorry, we are experiencing technical problems',
    message: 'Your session may have timed out.',
    includeReturnUrl: true
  }
}

function middleware (page) {
  return (req, res, next) => {
    const mandate = _.get(res, 'locals.mandate')
    if (mandate) {
      const mandateInternalState = _.get(mandate, 'internalState')
      const stateIsAllowed = pageToValidMandateStateMap[page].includes(mandateInternalState)
      if (stateIsAllowed) {
        next()
      } else {
        const content = _.get(mandateStateToMessageMap, mandateInternalState, mandateStateToMessageMap.default)
        logger.info(`[${req.correlationId}] Mandate ${mandate.externalId} is in internal state ${mandateInternalState} and not valid for page ${page}`)
        response(req, res, 'common/templates/mandate_state_page', {
          message: content.message,
          heading: content.heading,
          returnUrl: mandate.returnUrl,
          status: mandateInternalState,
          includeReturnUrl: content.includeReturnUrl
        })
      }
    } else {
      next()
    }
  }
}

module.exports = {
  middleware
}
