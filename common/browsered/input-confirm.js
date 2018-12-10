'use strict'

module.exports = () => {
  function insertAfter (newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
  }

  const inputs = Array.prototype.slice.call(document.querySelectorAll('[data-confirmation]'))

  inputs.forEach(input => {
    input.addEventListener('input', confirmInput, false)
  })

  function confirmInput (e) {
    const input = e.target
    const value = input.value
    const confirmationId = `${input.id}-confirmation`
    const confirmationPrepend = input.dataset.confirmationPrepend || ''
    let confirmation = document.getElementById(confirmationId)

    if (!confirmation) {
      confirmation = document.createElement('div')
      confirmation.innerHTML = `
      <div id="${confirmationId}" class="govuk-inset-text input-confirm">
        <p class="govuk-body">
          ${input.dataset.confirmationLabel}<span class="input-confirmation"></span>
        </p>
      </div>`
      const formGroup = input.closest('.govuk-form-group')
      insertAfter(confirmation, formGroup)
    }

    if (value === '') {
      confirmation.remove()
    } else {
      document
        .querySelector(`#${confirmationId} .input-confirmation`)
        .innerText = confirmationPrepend + value
    }
  }
}
