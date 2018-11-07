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

  if (every(validatedFields, 'valid')) {
    form.submit()
  } else {
    populateErrorSummary(form)
  }
}

function clearPreviousErrors () {
  const previousErrorsMessages = Array.prototype.slice.call(document.querySelectorAll('.error-message, .error-summary'))
  const previousErrorsFieldGroups = Array.prototype.slice.call(document.querySelectorAll('.form-group.form-group-error'))
  const previousErrorsFields = Array.prototype.slice.call(document.querySelectorAll('.form-control.form-control-error'))

  previousErrorsMessages.map(error => error.remove())
  previousErrorsFieldGroups.map(errorFieldGroup => errorFieldGroup.classList.remove('form-group-error'))
  previousErrorsFields.map(errorField => errorField.classList.remove('form-control-error'))
}

function findFields (form) {
  const formFields = Array.prototype.slice.call(form.querySelectorAll('input, textarea, select'))

  return formFields.filter(field => {
    return field.hasAttribute('data-validate')
  })
}

function validateField (form, field) {
  let result = {}
  let validationTypes = field.getAttribute('data-validate').split(' ')

  validationTypes.forEach(validationType => {
    switch (validationType) {
      case 'sort-code' :
        result = checks.isSortCode(field.value)
        break
      case 'account-number' :
        result = checks.isAccountNumber(field.value)
        break
      case 'email' :
        result = checks.isValidEmail(field.value)
        break
      case 'is-checked' :
        result = checks.isChecked(field)
        break
      default :
        result = checks.isNotEmpty(field.value)
        break
    }
    if (!result.valid) {
      applyErrorMessaging(form, field, result)
    }
  })

  return result
}

function applyErrorMessaging (form, field, result) {
  // Modify the field
  if (!field.classList.contains('form-control-error')) {
    field.classList.add('form-control-error')
  }
  // Modify the form group
  let formGroup = field.closest('.form-group')
  if (!formGroup.classList.contains('form-group-error')) {
    formGroup.classList.add('form-group-error')
    const errorLegendElement = formGroup.querySelector('legend')
    if (errorLegendElement === null) {
      const errorElement = document.querySelector('label[for="' + field.name + '"]')
      const errorLabel = result.message || errorElement.getAttribute('data-error-label')
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
    fields: Array.prototype.slice.call(form.querySelectorAll('.form-group.form-group-error')).map(formGroup => {
      let label = null
      let id = null
      if (formGroup.querySelector('legend') === null) {
        label = formGroup.querySelector('label').innerHTML.split('<')[0].trim()
        id = formGroup.querySelector('label').getAttribute('for')
      } else {
        label = formGroup.querySelector('h1').innerText.trim()
        id = formGroup.querySelector('h1').getAttribute('id')
      }
      return { label, id }
    })
  }

  form.parentNode.insertAdjacentHTML(
    'afterbegin',
    validationErrorsTemplate(configuration)
  )
  window.scroll(0, 0)
}
