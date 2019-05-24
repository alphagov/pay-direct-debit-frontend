'use strict'

const countries = require('../utils/countries')

class Service {
  constructor (opts) {
    this.externalId = opts.external_id
    this.name = opts.service_name.en
    this.gatewayAccountIds = opts.gateway_account_ids
    this.merchantDetails = opts.merchant_details ? {
      name: opts.merchant_details.name,
      addressLine1: opts.merchant_details.address_line1,
      addressLine2: opts.merchant_details.address_line2,
      city: opts.merchant_details.address_city,
      postcode: opts.merchant_details.address_postcode,
      countryName: countries.translateCountryISOtoName(opts.merchant_details.address_country),
      phoneNumber: opts.merchant_details.telephone_number,
      email: opts.merchant_details.email
    } : undefined
  }
}

module.exports = Service
