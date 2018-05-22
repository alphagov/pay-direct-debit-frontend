'use strict'

// local dependencies
const fieldValidationChecks = require('../../browsered/field-validation-checks')

module.exports = (payer) => {
  const errors = []

  if (!fieldValidationChecks.isNotEmpty(payer.accountHolderName).valid) {
    errors.push({
      id: 'account-holder-name',
      label: 'Name on the account'
    })
  }

  if (!fieldValidationChecks.isSortCode(payer.sortCode).valid) {
    errors.push({
      id: 'sort-code',
      label: 'Sort code'
    })
  }

  if (!fieldValidationChecks.isAccountNumber(payer.accountNumber).valid) {
    errors.push({
      id: 'account-number',
      label: 'Account number'
    })
  }

  if (payer.requiresAuthorisation === true) {
    errors.push({
      id: 'requires-authorisation',
      label: 'Are you allowed to authorise Direct Debits on this account?'
    })
  }

  if (!fieldValidationChecks.isValidEmail(payer.email).valid) {
    errors.push({
      id: 'email',
      label: 'Email address'
    })
  }

  return errors
}
