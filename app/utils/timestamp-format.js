'use strict'

const { format } = require('winston')

module.exports = format((info) => {
  info['@timestamp'] = new Date().toISOString()
  return info
})
