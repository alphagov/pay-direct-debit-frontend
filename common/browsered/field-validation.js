'use strict'

// NPM Dependencies
const every = require('lodash/every')

// Local Dependencies
const checks = require('./field-validation-checks')

// Global constants
const validationErrorsTemplate = require('../templates/includes/validation-errors.njk')

exports.enableFieldValidation = function () {
  const allForms = Array.prototype.slice.call(document.getElementsByTagName('form'))

  allForms.filter(form => {
    return form.hasAttribute('data-validate')
  }).map(form => {
    form.addEventListener('submit', initValidation, false)
  })
}

function initValidation (e) {
  let form = e.target
  e.preventDefault()
  clearPreviousErrors()

  let validatedFields = findFields(form)
    .map(field => validateField(form, field))

  if (every(validatedFields)) {
    form.submit()
  } else {
    populateErrorSummary(form)
  }
}

function clearPreviousErrors () {
  let previousErrorsMessages = Array.prototype.slice.call(document.querySelectorAll('.error-message, .error-summary'))
  let previousErrorsFields = Array.prototype.slice.call(document.querySelectorAll('.form-group.error'))

  previousErrorsMessages.map(error => error.remove())
  previousErrorsFields.map(errorField => errorField.classList.remove('error'))
}

function findFields (form) {
  const formFields = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'))

  return formFields.filter(field => {
    return field.hasAttribute('data-validate')
  })
}

function validateField (form, field) {
  let result = null
  let validationTypes = field.getAttribute('data-validate').split(' ')

  validationTypes.forEach(validationType => {
    switch (validationType) {
      case 'currency' :
        result = checks.isCurrency(field.value)
        break
      case 'email' :
        result = checks.isValidEmail(field.value)
        break
      case 'phone' :
        result = checks.isPhoneNumber(field.value)
        break
      case 'https' :
        result = checks.isHttps(field.value)
        break
      case 'belowMaxAmount' :
        result = checks.isBelowMaxAmount(field.value)
        break
      case 'sort-code' :
        result = checks.isSortCode(field.value)
        break
      case 'account-number' :
        result = checks.isAccountNumber(field.value)
        break
      case 'is-checked' :
        result = checks.isChecked(field)
        break
      default :
        result = checks.isNotEmpty(field.value)
        break
    }
    if (result !== null) {
      applyErrorMessaging(form, field, result)
    }
  })

  if (result === null) {
    return true
  }
}

function applyErrorMessaging (form, field, result) {
  let formGroup = field.closest('.form-group')
  if (!formGroup.classList.contains('error')) {
    formGroup.classList.add('error')
    const errorLegendElement = formGroup.querySelector('legend')
    if (errorLegendElement === null) {
      const errorElement = document.querySelector('label[for="' + field.name + '"]')
      const errorLabel = errorElement.getAttribute('data-error-label')
      if (errorLabel) {
        result = errorLabel
      }
      errorElement.insertAdjacentHTML('beforeend',
        '<span class="error-message">' + result + '</span>')
    } else {
      const errorLabel = errorLegendElement.getAttribute('data-error-label')
      if (errorLabel) {
        result = errorLabel
      }
      const errorElement = document.createElement('span')
      errorElement.setAttribute('class', 'error-message')
      errorElement.innerText = result
      errorLegendElement.appendChild(errorElement)
    }
  }
}

function populateErrorSummary (form) {
  const erroringformGroups = Array.prototype.slice.call(form.querySelectorAll('.form-group.error'))
  const configuration = {
    fields: erroringformGroups.map(formGroup => {
      const errorLegendElement = formGroup.querySelector('legend')
      if (errorLegendElement === null) {
        const label = formGroup.querySelector('label').innerHTML.split('<')[0].trim()
        const id = formGroup.querySelector('label').getAttribute('for')
        return {label, id}
      } else {
        const label = formGroup.querySelector('h1').innerText.trim()
        const id = formGroup.querySelector('h1').getAttribute('id')
        return {label, id}
      }
    })
  }

  form.parentNode.insertAdjacentHTML(
    'afterbegin',
    validationErrorsTemplate(configuration)
  )
  window.scroll(0, 0)
}
