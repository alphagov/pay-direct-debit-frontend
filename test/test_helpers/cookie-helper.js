'use strict'

// npm dependencies
const clientSession = require('client-sessions')

// local dependencies
const cookieConfig = require('../../common/config/cookies')

let configs = []

for (const property in cookieConfig) {
  configs.push(cookieConfig[property])
}

exports.CookieBuilder = class CookieBuilder {
  constructor () {
    this._cookies = {}
  }
  withPaymentRequest (paymentRequestfixture) {
    this.withCookie('session', {
      paymentRequest: paymentRequestfixture
    })
    return this
  }
  withConfirmationDetails (payerFixture) {
    this.withCookie('session', {
      confirmationDetails: payerFixture
    })
    return this
  }
  withCookie (cookieName, value) {
    this._cookies[cookieName] = Object.assign(this._cookies[cookieName] || {}, value)
    return this
  }
  build () {
    let cookiesArray = []
    Object.keys(this._cookies).forEach(cookieName => {
      const config = configs.find(config => config.cookieName === cookieName)
      const value = config ? clientSession.util.encode(config, this._cookies[cookieName]) : this._cookies[cookieName]
      cookiesArray.push(`${cookieName}=${value}`)
    })
    return cookiesArray.join('; ')
  }
}

exports.decryptCookie = (rawCookieHeader) => {
  const cookies = {}

  rawCookieHeader.forEach(rawCookie => {
    const formatted = {}
    const tuples = rawCookie
      .split(';')
      .map(cookie => cookie.split('=').map(item => item.trim()))
    const cookieName = tuples[0][0]
    const config = configs.find(config => config.cookieName === cookieName)
    tuples[0][0] = 'content'
    tuples.forEach(tuple => {
      formatted[tuple[0]] = tuple[1] || true
    })
    if (config) Object.assign(formatted, clientSession.util.decode(config, formatted.content))
    cookies[cookieName] = formatted
  })

  return cookies
}
