'use strict'

// local dependencies
const fieldValidationChecks = require('../../browsered/field-validation-checks')

module.exports = (payer) => {
  const errors = []

  if (fieldValidationChecks.isNotEmpty(payer.accountHolderName) !== null) {
    errors.push({
      id: 'account-holder-name',
      label: 'Name on the account',
      errorMessage: fieldValidationChecks.isNotEmpty(payer.accountHolderName)
    })
  }

  if (fieldValidationChecks.isSortCode(payer.sortCode) !== null) {
    errors.push({
      id: 'sort-code',
      label: 'Sort code',
      errorMessage: fieldValidationChecks.isSortCode(payer.sortCode)
    })
  }

  if (fieldValidationChecks.isAccountNumber(payer.accountNumber) !== null) {
    errors.push({
      id: 'account-number',
      label: 'Account number',
      errorMessage: fieldValidationChecks.isAccountNumber(payer.accountNumber)
    })
  }

  if (payer.requiresAuthorisation === true) {
    errors.push({
      id: 'requires-authorisation',
      label: 'Are you allowed to authorise Direct Debits on this account?',
      errorMessage: fieldValidationChecks.isRequiresAuthorisationChecked(false)
    })
  }

  if (fieldValidationChecks.isNotEmpty(payer.country) !== null) {
    errors.push({
      id: 'country-code',
      label: 'Country',
      errorMessage: fieldValidationChecks.isNotEmpty(payer.country)
    })
  }

  if (fieldValidationChecks.isNotEmpty(payer.addressLine1) !== null) {
    errors.push({
      id: 'address-line1',
      label: 'Building and street',
      errorMessage: fieldValidationChecks.isNotEmpty(payer.addressLine1)
    })
  }

  if (fieldValidationChecks.isNotEmpty(payer.city) !== null) {
    errors.push({
      id: 'city',
      label: 'Town or city',
      errorMessage: fieldValidationChecks.isNotEmpty(payer.city)
    })
  }

  if (fieldValidationChecks.isNotEmpty(payer.postcode) !== null) {
    errors.push({
      id: 'postcode',
      label: 'Postcode',
      errorMessage: fieldValidationChecks.isNotEmpty(payer.postcode)
    })
  }

  if (fieldValidationChecks.isValidEmail(payer.email) !== null) {
    errors.push({
      id: 'email',
      label: 'Email address',
      errorMessage: fieldValidationChecks.isValidEmail(payer.email)
    })
  }

  return errors
}
