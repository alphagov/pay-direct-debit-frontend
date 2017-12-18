'use strict'

// Local dependencies
const countries = require('../../common/middleware/countries')

module.exports = (req, res) => {
  const params = {
    countries: countries.retrieveCountries()
  }
  res.render('app/index/get', params)
}
