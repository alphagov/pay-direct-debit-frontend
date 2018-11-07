'use strict'

const clientSessions = require('client-sessions')
const _ = require('lodash')
const middlewareUtils = require('../../common/utils/middleware')

const { COOKIE_MAX_AGE, SESSION_ENCRYPTION_KEY, SESSION_ENCRYPTION_KEY_2, SECURE_COOKIE_OFF } = process.env
const SESSION_COOKIE_NAME_1 = 'direct_debit_frontend_state'
const SESSION_COOKIE_NAME_2 = 'direct_debit_frontend_state_2'
const KEY_MIN_LENGTH = 10

function checkEnv () {
  if (!isValidKey(SESSION_ENCRYPTION_KEY) && !isValidKey(SESSION_ENCRYPTION_KEY_2)) {
    throw new Error('cookie encryption key is not set')
  }
  if (!COOKIE_MAX_AGE) {
    throw new Error('cookie max age is not set')
  }
}

/**
 * Returns valid client-sessions configuration for supplied
 * cookie name and encryption key
 **
 * @param {string} name
 * @param {string} key
 *
 * @returns {object}
 * */
function namedCookie (name, key) {
  checkEnv()
  return {
    cookieName: name, // cookie name dictates the key name added to the request object
    secret: key,
    duration: parseInt(COOKIE_MAX_AGE), // how long the session will stay valid in ms
    proxy: true,
    cookie: {
      ephemeral: false, // when true, cookie expires when the browser closes
      httpOnly: true, // when true, cookie is not accessible from javascript
      secureProxy: SECURE_COOKIE_OFF !== 'true'
    }
  }
}
/**
 * @private
 *
 * @param {string} key
 * @returns {boolean}
 */
function isValidKey (key) {
  return !!key && typeof key === 'string' && key.length > KEY_MIN_LENGTH
}
/**
 * Initialises app with client_sessions middleware.
 * Configures one middleware per existing encryption key, to enable multiple
 * keys to exist simultaneously, allowing key rotation.
 *
 * @param {Express.App} app
 */
function configureSessionCookie (app) {
  checkEnv()
  if (isValidKey(SESSION_ENCRYPTION_KEY)) app.use(middlewareUtils.excludingPaths(['/healthcheck'], clientSessions(namedCookie(SESSION_COOKIE_NAME_1, SESSION_ENCRYPTION_KEY))))
  if (isValidKey(SESSION_ENCRYPTION_KEY_2)) app.use(middlewareUtils.excludingPaths(['/healthcheck'], clientSessions(namedCookie(SESSION_COOKIE_NAME_2, SESSION_ENCRYPTION_KEY_2))))
}

/**
 * Sets session[key] = value for all valid sessions, based on existence of encryption key,
 * and the existence of relevant cookie on the request
 *
 * @param {Request} req
 * @param {string} key
 * @param {*} value
 */
function setSessionVariable (req, key, value) {
  if (SESSION_ENCRYPTION_KEY) {
    setValueOnCookie(req, key, value, SESSION_COOKIE_NAME_1)
  }

  if (SESSION_ENCRYPTION_KEY_2) {
    setValueOnCookie(req, key, value, SESSION_COOKIE_NAME_2)
  }
}

/**
 * Gets value of key from session, based on existence of encryption key
 *
 * @param {Request} req
 * @param {string} key
 * @returns {*}
 */
function getSessionVariable (req, key) {
  const session = _.get(req, getSessionCookieName())
  return session && session[key]
}
/**
 * Returns current 'active' cookie name based on
 * existing env vars. Favours `SESSION_ENCRYPTION_KEY`
 * over `SESSION_ENCRYPTION_KEY_2`
 *
 * @returns {string}
 */
function getSessionCookieName () {
  if (isValidKey(SESSION_ENCRYPTION_KEY)) {
    return SESSION_COOKIE_NAME_1
  } else if (isValidKey(SESSION_ENCRYPTION_KEY_2)) {
    return SESSION_COOKIE_NAME_2
  }
}

/**
 * @private
 *
 * @param {object} req
 * @param {string} key
 * @param {*} value
 * @param {string} cookieName
 */
function setValueOnCookie (req, key, value, cookieName) {
  if (typeof _.get(req, `${cookieName}`) !== 'object') return
  _.set(req, `${cookieName}.${key}`, value)
}
module.exports = {
  namedCookie: namedCookie,
  configureSessionCookie: configureSessionCookie,
  getSessionCookieName: getSessionCookieName,
  setSessionVariable: setSessionVariable,
  getSessionVariable: getSessionVariable
}
