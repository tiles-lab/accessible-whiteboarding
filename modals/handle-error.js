const failureMessage = document.querySelector('#form-failure-message')

export const handleError = (message) => {
    if (failureMessage) {
        failureMessage.textContent = message
    }
}