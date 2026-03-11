const HIDDEN_CLASS = 'ally-wb-hidden'

export const onToggleColorInput = () => {
    // Handles multiple color inputs
    const toggleColorInput = document.querySelectorAll('.toggle-color-input')

    toggleColorInput.forEach(toggle => toggle?.addEventListener('change', (event) => {
        const isChecked = event.target.checked
        const colorInputContainer = event.target?.parentNode?.parentNode?.children?.[1]
        const colorInput = colorInputContainer?.children?.[1]

        if (Boolean(colorInput)) {
            if (isChecked) {
                colorInputContainer.classList.remove(HIDDEN_CLASS)
                colorInput.disabled = false
            } else {
                colorInputContainer?.classList?.add(HIDDEN_CLASS)
                colorInput.disabled = true
            }
        }
    }))
}

const addForm = document.querySelector('#add-form')
const editForm = document.querySelector('#edit-form')
const forms = [addForm, editForm]

forms?.forEach(form => form?.addEventListener('reset', () => {
    const toggleColorInput = document.querySelectorAll('.toggle-color-input')

    // Hide/disable color inputs when form resets
    toggleColorInput.forEach(toggle => {
        const toggleInput = toggle?.children[0]
        const colorInputContainer = toggleInput.parentNode?.parentNode?.children?.[1]
        const colorInput = colorInputContainer?.children?.[1]

        if (Boolean(colorInput)) {
            colorInputContainer?.classList?.add(HIDDEN_CLASS)
            colorInput.disabled = true
        }
    })
}))