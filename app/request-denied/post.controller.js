'use strict'

const { renderErrorView } = require('../../common/response')

module.exports = (req, res) => {
  renderErrorView(req, res, 'No money has been taken from your account, please try again later.', 500)
}
