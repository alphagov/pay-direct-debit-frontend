'use strict'

const { format } = require('winston')

module.exports = format((info) => {
  info['@timestamp'] = new Date().toISOString()
  info['@version'] = 1
  info.level = info.level.toUpperCase()
  return info
})
