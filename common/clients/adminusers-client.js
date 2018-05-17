'use strict'

// Local Dependencies
const baseClient = require('./base-client/base-client')
const {ADMINUSERS_URL} = require('../config')
const Service = require('../../common/classes/Service.class')

const service = 'adminusers'
const baseUrl = `${ADMINUSERS_URL}/v1`
const headers = {
}

// Exports
module.exports = {
  retrieveService
}

function retrieveService (gatewayAccountId, correlationId) {
  return baseClient.get({
    headers,
    baseUrl,
    url: `/api/services`,
    qs: {
      gatewayAccountId: gatewayAccountId
    },
    service: service,
    correlationId: correlationId,
    description: `retrieve a service by gateway account`
  }).then(service => new Service(service))
}
