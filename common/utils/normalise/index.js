'use strict'

function sortCode (value) {
  return value.replace(/\D/g, '')
}

function accountNumber (value) {
  return value.replace(/\D/g, '')
}

/**
 * Converts string to boolean
 * @param value as string representation of a boolean 'true' or 'false'
 * @returns boolean
 */
function toBoolean (value) {
  if (value === 'true') {
    return true
  } else if (value === 'false') {
    return false
  }
}

// Exports
module.exports = {
  sortCode,
  accountNumber,
  toBoolean
}
