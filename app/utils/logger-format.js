'use strict'

const { format } = require('winston')

module.exports = format((info, opts) => {
  info['@timestamp'] = new Date().toISOString()
  info['@version'] = 1
  info['container'] = opts.container
  info.level = info.level.toUpperCase()
  return info
})
