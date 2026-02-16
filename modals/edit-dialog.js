import { getInputElement } from './input-elements'
import { onToggleColorInput } from './toggle-color-input'

const title = document.querySelector('#dialog-title')

const formFields = document.querySelector('#edit-form-fields')
const formInputs = []
const formErrors = document.querySelector('#edit-form-errors')

const ITEM_ID_KEY = 'data-item-id'

const fetchModalData = async () => await miro.board.ui.getModalData()
const modalData = fetchModalData().then((data) => {
    title.textContent = data.title
    data.fields.forEach((field) => formInputs.push(getInputElement(field)))
    formFields.setAttribute(ITEM_ID_KEY, data.item.id)
}).finally(() => {
    if (formInputs.length) {
        formFields.innerHTML = formInputs.join('')
        onToggleColorInput()
    } else {
        console.error('Error getting form fields')
        formErrors.textContent = 'Error loading form'
    }
})

const form = document.querySelector('#edit-form')
form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(form)
    const itemId = formFields.getAttribute(ITEM_ID_KEY)

    if (itemId) {
        const item = await miro.board.getById(itemId)

        if (item) {
            const formFieldNames = formData.keys()
            for (const formFieldName of formFieldNames) {
                // Handle nested field names, like style.fillColor
                const formFieldNameChildren = formFieldName.split('.')
                const lastFieldName = formFieldNameChildren.pop()
                let currentFieldName = item

                for (const fieldNameChild of formFieldNameChildren) {
                    if (!currentFieldName[fieldNameChild]) {
                        currentFieldName[fieldNameChild] = {}
                    }
                    currentFieldName = currentFieldName[fieldNameChild]
                }
                currentFieldName[lastFieldName] = formData.get(formFieldName)
            }

            await item.sync()
            window.sessionStorage.setItem('updated_miro_item', JSON.stringify(item))
            await miro.board.ui.closeModal()
        } else {
            console.error('Error loading item')
        }
    } else {
        console.error('Missing item ID')
    }
})
