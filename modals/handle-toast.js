const successMessage = document.querySelector('#form-success-message')

export const handleToast = (message) => {
    if (successMessage) {
        successMessage.textContent = message
    
        // setTimeout(async () => {
        //     await miro.board.ui.closeModal()
        // }, 3000)
    }
}