'use strict'

// npm dependencies
const lodash = require('lodash')

// Local dependencies
let countries = require('./data/countries.json')
const extensions = require('./data/country-record-extension.json')

// Merge the additional data into the register data
countries.forEach((country, i) => {
  const extension = extensions.find(item => item.country === country.entry.country)
  country.entry.selected = country.entry.country === 'GB'
  if (extension) {
    country.entry.aliases = extension.aliases
    country.entry.weighting = extension.weighting
  }
})

// Prepare and sort the date
countries = lodash.compact(countries)
countries = lodash.sortBy(countries, country => country.entry.name.toLowerCase())

// Exports
module.exports = {
  retrieveCountries: () => lodash.clone(countries),
  translateAlpha2: alpha2Code => countries.find(country => country.entry.country === alpha2Code).entry.name
}
