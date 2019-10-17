'use strict'

const { createNamespace } = require('cls-hooked')
const session = createNamespace('govuk-pay-logging')

module.exports = (req, res, next) => {
  session.run(() => {
    next()
  })
}
