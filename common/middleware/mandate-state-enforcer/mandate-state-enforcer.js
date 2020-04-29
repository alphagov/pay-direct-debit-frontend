// npm dependencies
const _ = require('lodash')

// local dependencies
const logger = require('../../../app/utils/logger')(__filename)
const { response } = require('../../response')

const pageToValidMandateStateMap = {
  setup: ['AWAITING_DIRECT_DEBIT_DETAILS'],
  confirmation: ['AWAITING_DIRECT_DEBIT_DETAILS'],
  cancel: ['AWAITING_DIRECT_DEBIT_DETAILS']
}

const inProgressMessage = {
  heading: 'Your Direct Debit mandate is being processed',
  message: 'Check your confirmation email for details of your mandate.',
  includeReturnUrl: false
}

const mandateStateToMessageMap = {
  SUBMITTED_TO_PROVIDER: inProgressMessage,
  SUBMITTED_TO_BANK: inProgressMessage,
  ACTIVE: inProgressMessage,
  FAILED: {
    heading: 'Your Direct Debit mandate has not been set up',
    message: 'You might have entered your details incorrectly or your session may have timed out.',
    includeReturnUrl: true
  },
  USER_SETUP_EXPIRED: {
    heading: 'Your Direct Debit mandate has not been set up',
    message: 'You might have entered your details incorrectly or your session may have timed out.',
    includeReturnUrl: true
  },
  USER_SETUP_CANCELLED: {
    heading: 'You have cancelled the Direct Debit mandate setup',
    message: 'Your mandate has not been set up.',
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
