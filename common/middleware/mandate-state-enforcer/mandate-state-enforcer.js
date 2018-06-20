// npm dependencies
const _ = require('lodash')
const logger = require('pino')()

// local dependencies
const {response} = require('../../response')

const pageToValidMandateStateMap = {
  'setup': ['started'],
  'confirmation': ['started', 'pending'],
  'cancel': ['cancelled', 'inactive']
}

const mandateStateToMessageMap = {
  'cancelled': 'You cancelled your request. Start again',
  'pending': 'Being processed. Refer to your email for contact details',
  'failed': 'No longer in process. Start again',
  'active': 'Your mandate has been setup. Refer to your email for contact details',
  'created': 'Technical error',
  'submitted': 'Technical error',
  'inactive': 'You cancelled your request. Start again'
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
        const message = _.get(mandateStateToMessageMap, mandateState, 'An error has occurred')
        logger.info(`[${req.correlationId}] Mandate ${mandate.externalId} is in state ${mandateState} and not valid for page ${page}`)
        response(req, res, 'common/templates/mandate_state_page', {
          message,
          heading: 'Heading',
          returnUrl: mandate.returnUrl
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
