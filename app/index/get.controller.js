'use strict'

// Local dependencies
const countries = require('../../common/utils/countries')

module.exports = (req, res) => {
  const params = {
    countries: countries.retrieveCountries()
  }
  res.render('app/index/get', params)
}
