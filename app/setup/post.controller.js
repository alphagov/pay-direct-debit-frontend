'use strict'

// Local dependencies
const confirmation = require('./../confirmation')

module.exports = (req, res) => {
  res.redirect(confirmation.paths.index)
}
