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
  let isValid = true
  let validationTypes = field.getAttribute('data-validate').split(' ')

  validationTypes.forEach(validationType => {
    switch (validationType) {
      case 'sort-code' :
        isValid = checks.isSortCode(field.value)
        break
      case 'account-number' :
        isValid = checks.isAccountNumber(field.value)
        break
      case 'email' :
        isValid = checks.isValidEmail(field.value)
        break
      case 'is-checked' :
        isValid = checks.isChecked(field)
        break
      default :
        isValid = !checks.isEmpty(field.value)
        break
    }
    if (!isValid) {
      applyErrorMessaging(form, field)
    }
  })

  return isValid
}

function applyErrorMessaging (form, field) {
  let formGroup = field.closest('.form-group')
  if (!formGroup.classList.contains('error')) {
    formGroup.classList.add('error')
    const errorLegendElement = formGroup.querySelector('legend')
    if (errorLegendElement === null) {
      const errorElement = document.querySelector('label[for="' + field.name + '"]')
      const errorLabel = errorElement.getAttribute('data-error-label')
      errorElement.appendChild(generateErrorMessageElement(errorLabel))
    } else {
      errorLegendElement.appendChild(generateErrorMessageElement(errorLegendElement.getAttribute('data-error-label')))
    }
  }
}

function generateErrorMessageElement (message) {
  const errorElement = document.createElement('span')
  errorElement.setAttribute('class', 'error-message')
  errorElement.innerText = message
  return errorElement
}

function populateErrorSummary (form) {
  const configuration = {
    fields: Array.prototype.slice.call(form.querySelectorAll('.form-group.error')).map(formGroup => {
      let label = null
      let id = null
      if (formGroup.querySelector('legend') === null) {
        label = formGroup.querySelector('label').innerHTML.split('<')[0].trim()
        id = formGroup.querySelector('label').getAttribute('for')
      } else {
        label = formGroup.querySelector('h1').innerText.trim()
        id = formGroup.querySelector('h1').getAttribute('id')
      }
      return {label, id}
    })
  }

  form.parentNode.insertAdjacentHTML(
    'afterbegin',
    validationErrorsTemplate(configuration)
  )
  window.scroll(0, 0)
}
