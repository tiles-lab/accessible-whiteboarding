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
    window.sessionStorage.setItem('updated_miro_items', JSON.stringify([
        {
            ...frame,
            childrenIds: [...frame.childrenIds, item.id]
        },
        {
            ...item,
            parentId: frame.id
        }
    ]))

    await miro.board.ui.closeModal()
}

const removeFromFrame = async (itemId) => {
    const item = await miro.board.getById(itemId)
    const frame = await miro.board.getById(item.parentId)

    // Add to frame
    await frame.remove(item)

    // Sync with panel
    window.sessionStorage.setItem('updated_miro_items', JSON.stringify([
        {
            ...frame,
            childrenIds: frame.childrenIds.filter(child => child !== item.id)
        },
        {
            ...item,
            parentId: null
        }
    ]))

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

window.addEventListener('DOMContentLoaded', () => {
  title?.focus()
})

const moveToBoardContainer = document.querySelector('#move-form-move-to-board-container')

fetchModalData().then(data => {
    title.textContent = data.title

    framesList.innerHTML = frames.map(
        (frame) => getFrameListItem(data.item, frame)
    ).join()

    if (data.item?.parentId) {
        const moveToBoardButton = document.createElement('button')
        moveToBoardButton.textContent = 'Move to Board'
        moveToBoardContainer.appendChild(moveToBoardButton)
        moveToBoardButton.addEventListener('click', () => {
            removeFromFrame(data.item.id)
        })
    }
}).finally(() => {
    const moveFrameButtons = document.querySelectorAll('.move-form-frame-button')

    moveFrameButtons.forEach(frameButton => frameButton?.addEventListener('click', (event) => {
        const frameId = event.target.dataset.frameId
        const itemId = event.target.dataset.itemId
        moveToFrame(itemId, frameId)
    }))
})