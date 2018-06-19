// npm dependencies
const _ = require('lodash')
const logger = require('pino')()

// local dependencies
const {renderErrorView} = require('../../response')

const pageStateMap = {
  'setup': ['started'],
  'confirmation': ['started', 'pending'],
  'cancel': ['cancelled', 'inactive']
}

const stateToErrorMessageMap = {
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
    const mandate = res.locals.mandate
    if (mandate) {
      const mandateState = mandate.state.status
      const stateIsAllowed = pageStateMap[page].includes(mandateState)

      if (stateIsAllowed) {
        next()
      } else {
        const errorMessage = _.get(stateToErrorMessageMap, mandateState, 'An error has occurred')
        logger.info(`[${req.correlationId}] Mandate ${mandate.externalId} is in state ${mandateState} and not valid for page ${page}`)
        renderErrorView(req, res, errorMessage, 500, 'Error', true)
      }
    } else {
      next()
    }
  }
}

module.exports = {
  middlewareWrapper
}
