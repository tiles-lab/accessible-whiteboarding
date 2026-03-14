const successMessage = document.querySelector('#form-success-message')

export const handleToast = (message) => {
    if (successMessage) {
        successMessage.textContent = message
    
        setTimeout(async () => {
            const modalIsClosed = await miro.board.ui.canOpenModal();
                if (!modalIsClosed) {
                    await miro.board.ui.closeModal();
                }
        }, 2000)
    }
}