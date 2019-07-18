'use strict'

// NPM Dependencies
const every = require('lodash/every')

// Local Dependencies
const checks = require('./field-validation-checks')

// Global constants
const validationErrorsTemplate = require('../templates/includes/validation-errors.njk')

const ERROR_SUMMARY_CLASS = '.govuk-error-summary'
const FORM_GROUP = '.govuk-form-group'
const FORM_GROUP_WITH_ERROR = '.govuk-form-group--error'
const FORM_GROUP_ERROR_CLASSNAME = 'govuk-form-group--error'
const ERROR_LABEL_CLASSNAME = 'govuk-error-message'
const INPUT_ERROR_CLASSNAME = 'govuk-input--error'

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
  const previousErrorsMessages = Array.prototype.slice.call(document.querySelectorAll(ERROR_SUMMARY_CLASS))
  const previousErrorsFields = Array.prototype.slice.call(document.querySelectorAll(FORM_GROUP_WITH_ERROR))
  const previousErroredInputs = Array.prototype.slice.call(document.querySelectorAll(`.${INPUT_ERROR_CLASSNAME}`))
  const previousErrorLabels = Array.prototype.slice.call(document.querySelectorAll(`.${ERROR_LABEL_CLASSNAME}`))

  previousErroredInputs.map(errorField => errorField.classList.remove(INPUT_ERROR_CLASSNAME))
  previousErrorsMessages.map(error => error.remove())
  previousErrorsFields.map(errorField => errorField.classList.remove(FORM_GROUP_ERROR_CLASSNAME))
  previousErrorLabels.map(label => label.remove())
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
  if (!field.classList.contains(INPUT_ERROR_CLASSNAME)) {
    field.classList.add(INPUT_ERROR_CLASSNAME)
  }
  // Modify the form group
  let formGroup = field.closest(FORM_GROUP)
  if (!formGroup.classList.contains(FORM_GROUP_ERROR_CLASSNAME)) {
    formGroup.classList.add(FORM_GROUP_ERROR_CLASSNAME)
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
  errorElement.classList.add(ERROR_LABEL_CLASSNAME)
  errorElement.innerText = message
  return errorElement
}

function populateErrorSummary (form) {
  const configuration = {
    fields: Array.prototype.slice.call(form.querySelectorAll(FORM_GROUP_WITH_ERROR)).map(formGroup => {
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
