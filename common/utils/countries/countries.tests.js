'use strict'

// npm dependencies
const expect = require('chai').expect

// Local dependencies
const countries = require('./index')

describe('countries util', function () {
  it('should list countries ordered', function () {
    const retrievedCountries = countries.retrieveCountries()

    expect(retrievedCountries[0].entry.country).to.eql('AF')
    expect(retrievedCountries[1].entry.country).to.eql('AL')
  })

  it('should translate country code to name', function () {
    expect(countries.translateAlpha2('GB')).to.eql('United Kingdom')
  })
})
