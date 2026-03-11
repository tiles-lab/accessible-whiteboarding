import { getParentIdOptions } from './get-parent-id-options'
import { handleError } from './handle-error'
import { handleToast } from './handle-toast'
import { getInputElement } from './input-elements'
import { onToggleColorInput } from './toggle-color-input'

const title = document.querySelector('#dialog-title')

window.addEventListener('DOMContentLoaded', () => {
  title?.focus()
})

const formFields = document.querySelector('#add-form-fields')
const formInputs = []
const formErrors = document.querySelector('#add-form-errors')

const ITEM_TYPE_KEY = 'data-item-type'

const getFieldDataType = (data) => {
    if ('frameFields' in data) {
        return 'frame'
    }

    if ('stickyNoteFields' in data) {
        return 'sticky_note'
    }

    if ('textFields' in data) {
        return 'text'
    }

    return ''
}

const fetchModalData = async () => await miro.board.ui.getModalData()
const modalData = fetchModalData().then((data) => {
    title.textContent = data.title
    const fieldData = data?.frameFields ?? data?.stickyNoteFields ?? data?.textFields

    fieldData.forEach((field) => formInputs.push(getInputElement(field)))
    formFields.setAttribute(ITEM_TYPE_KEY, getFieldDataType(data))
}).finally(async () => {
    if (formInputs.length) {
        formFields.innerHTML = formInputs.join('')
        onToggleColorInput()
        await getParentIdOptions(formFields)
    } else {
        console.error('Error getting form fields')
        formErrors.textContent = 'Error loading form'
    }
})

const form = document.querySelector('#add-form')
form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(form)
    const dataType = formFields.getAttribute(ITEM_TYPE_KEY)

    try {
        let newItem

        if (dataType === 'frame') {
            await miro.board.createFrame({
                title: formData.get('title'),
                style: {
                    fillColor: formData.get('style.fillColor') ?? 'transparent'
                },
                width: +formData.get('width'),
                height: +formData.get('height')
            })
        }

        if (dataType === 'sticky_note') {
            newItem = await miro.board.createStickyNote({
                content: formData.get('content'),
                style: {
                    fillColor: formData.get('style.fillColor')
                },
            })
        }

        if (dataType === 'text') {
            newItem = await miro.board.createText({
                content: formData.get('content'),
                parentId: formData.get('parentId')
            })
        }

        const parentId = formData.get('parentId')

        if (parentId) {
            const parentFrame = await miro.board.getById(parentId)
            newItem.x = parentFrame.x + 1
            newItem.y = parentFrame.y + 1
            await newItem.sync()
            await parentFrame.add(newItem)

            window.sessionStorage.setItem('updated_miro_items', JSON.stringify([
                {
                    ...parentFrame,
                    childrenIds: [...parentFrame.childrenIds, newItem.id]
                },
                {
                    ...newItem,
                    parentId: parentFrame.id
                }
            ]))
        }

        await miro.board.ui.closeModal()
        handleToast('Item added')
    } catch (error) {
        console.error('Error adding item: ', error.message)
        handleError('Error adding item')
    }
})
