'use strict'
// Create random values if none provided
const randomExternalId = () => Math.random().toString(36).substring(7)
const randomAmount = () => Math.round(Math.random() * 10000) + 1

module.exports = {
  validTokenExchangeResponse: (opts = {}) => {
    const data = {
      external_id: opts.external_id || randomExternalId(),
      amount: opts.amount || 'pay-api-token',
      name: opts.type || 'CHARGE',
      price: opts.state || randomAmount()
    }
    return {
      getPlain: () => {
        return data
      }
    }
  }
}
