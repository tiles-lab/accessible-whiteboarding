import { handleToast } from "./handle-toast"

const title = document.querySelector('#dialog-title')

const deleteButton = document.querySelector('#delete-dialog-delete-button')
const cancelButton = document.querySelector('#delete-dialog-cancel-button')

const ITEM_ID_KEY = 'data-item-id'

const fetchModalData = async () => await miro.board.ui.getModalData()
const modalData = fetchModalData().then((data) => {
    title.textContent = data.title
    deleteButton.setAttribute(ITEM_ID_KEY, data.id)
})

deleteButton.addEventListener('click', async () => {
    const itemId = deleteButton.getAttribute(ITEM_ID_KEY)
    const item = await miro.board.getById(itemId)
    await miro.board.remove(item)
    handleToast('Item deleted')
})

cancelButton.addEventListener('click', async () => {
    await miro.board.ui.closeModal()
})