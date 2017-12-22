'use strict'

const SESSION_ENCRYPTION_KEY = process.env.SESSION_ENCRYPTION_KEY
const COOKIE_MAX_AGE_SESSION = process.env.COOKIE_MAX_AGE

if (!SESSION_ENCRYPTION_KEY) {
  throw new Error('cookie encryption key is not set')
}

if (!COOKIE_MAX_AGE_SESSION) {
  throw new Error('cookie max age is not set')
}

exports.session = {
  cookieName: 'session', // cookie name dictates the key name added to the request object
  secret: SESSION_ENCRYPTION_KEY,
  duration: parseInt(COOKIE_MAX_AGE_SESSION), // how long the session will stay valid in ms
  proxy: true,
  cookie: {
    ephemeral: false, // when true, cookie expires when the browser closes
    httpOnly: true, // when true, cookie is not accessible from javascript
    secureProxy: true
  }
}
