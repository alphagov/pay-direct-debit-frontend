'use strict'

// npm dependencies
const clientSession = require('client-sessions')
const _ = require('lodash')

// local dependencies
const cookieConfig = require('../../common/config/cookies')

exports.CookieBuilder = class CookieBuilder {
  constructor (gatewayAccountExternalId, mandateExternalId, transactionExternalId) {
    this._cookies = {}
    this.cookieName = 'direct_debit_frontend_state'
    this.gatewayAccountExternalId = gatewayAccountExternalId
    this.mandateExternalId = mandateExternalId
    this.transactionExternalId = transactionExternalId
    this.withCookie(this.cookieName, {
      'gatewayAccountExternalId': gatewayAccountExternalId,
      'mandateExternalId': mandateExternalId,
      'transactionExternalId': transactionExternalId
    })
  }
  withCookieName (cookieName) {
    this.cookieName = cookieName
    return this
  }
  withConfirmationDetails (payerFixture) {
    this.withCookie(this.cookieName, {
      confirmationDetails: payerFixture
    })
    return this
  }
  withCsrfSecret (value) {
    this.withCookie(this.cookieName, {
      csrfSecret: value
    })
    return this
  }
  withCookie (cookieName, value) {
    _.merge(this._cookies, {
      [cookieName]: {
        [this.mandateExternalId]: value
      }
    })
    return this
  }
  build () {
    const config = cookieConfig.namedCookie(this.cookieName, process.env.SESSION_ENCRYPTION_KEY)
    const cookiesArray = []
    Object.keys(this._cookies).forEach(cookieName => {
      const value = config ? clientSession.util.encode(config, this._cookies[cookieName]) : this._cookies[cookieName]
      cookiesArray.push(`${cookieName}=${value}`)
    })
    return cookiesArray.join('; ')
  }
}
