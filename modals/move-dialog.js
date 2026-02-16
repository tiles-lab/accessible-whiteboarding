const frames = []

const fetchModalData = async () => await miro.board.ui.getModalData()

const fetchFrames = async () => {
    const response = await miro.board.get({ type: 'frame' })

    for (const frame of response) {
        frames.push({
            id: frame.id,
            title: frame.title
        })
    }
}

fetchFrames()

const framesList = document.querySelector('#move-form-available-frames-list')

const moveToFrame = async (itemId, frameId) => {
    const frame = await miro.board.getById(frameId)
    const item = await miro.board.getById(itemId)

    // Move the item inside of the frame
    item.x = frame.x + 1
    item.y = frame.y + 1
    await item.sync()

    // Add to frame
    await frame.add(item)

    // Sync with panel
    window.sessionStorage.setItem('updated_miro_item', JSON.stringify(frame))
    window.sessionStorage.setItem('updated_miro_item', JSON.stringify({
        ...item,
        parentId: frame.id
    }))

    await miro.board.ui.closeModal()
}

const getFrameListItem = (item, frame) => {
    const isParent = item?.parentId === frame.id

    if (isParent) {
        return (
            `<li>
            ${frame.title} (Current Location)
            </li>`
        )
    } else {
        return (
            `<li>
                <button
                    type="button"
                    class="move-form-frame-button"
                    data-frame-id="${frame.id}"
                    data-item-id="${item.id}"
                >Move to ${frame.title}</button>
            </li>`
        )
    }
}

const title = document.querySelector('#dialog-title')

fetchModalData().then(data => {
    title.textContent = data.title

    framesList.innerHTML = frames.map(
        (frame) => getFrameListItem(data.item, frame)
    ).join()
}).finally(() => {
    const moveFrameButtons = document.querySelectorAll('.move-form-frame-button')

    moveFrameButtons.forEach(frameButton => frameButton?.addEventListener('click', (event) => {
        const frameId = event.target.dataset.frameId
        const itemId = event.target.dataset.itemId
        moveToFrame(itemId, frameId)
    }))
})