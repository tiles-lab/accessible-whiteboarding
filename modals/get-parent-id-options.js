export const getParentIdOptions = async (formFields) => {
    const frames = await miro.board.get({ type: 'frame' })

    const options = frames.map((frame) => `<option value="${frame.id}">${frame.title}</option>`)

    const parentSelect = formFields.querySelectorAll('#parentId')
    
    if (parentSelect?.length) {
        parentSelect.forEach((select) => select.innerHTML += options)
    }
}