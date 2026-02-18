const title = document.querySelector('#dialog-title')

const noExistingConnectionsMessage = document.querySelector('#connections-form-no-existing-connections')
const noNewConnectionsMessage = document.querySelector('#connections-form-no-new-connections')

const fetchModalData = async () => await miro.board.ui.getModalData()

const onRemoveConnection = async (connectorId, connectionItem, dataItem) => {
    const connector = await miro.board.getById(connectorId)
    await miro.board.remove(connector)

    window.sessionStorage.setItem('updated_miro_items', JSON.stringify([
        connector,
        {
            ...connectionItem,
            connectorIds: connectionItem.connectorIds.filter(id => id !== connectorId)
        },
        {
            ...dataItem,
            connectorIds: dataItem.connectorIds.filter(id => id !== connectorId)
        }
    ]))

    
    await miro.board.ui.closeModal()
}

const onAddConnection = async (startItem, endItem) => {
    const connector = await miro.board.createConnector({
        start: {
            item: startItem.id,
            snapTo: 'right'
        },
        end: {
            item: endItem.id,
            snapTo: 'left'
        }
    })

    window.sessionStorage.setItem('updated_miro_items', JSON.stringify([
        connector,
        {
            ...startItem,
            connectorIds: [...startItem.connectorIds, connector.id]
        },
        {
            ...endItem,
            connectorIds: [...endItem.connectorIds, connector.id]
        }
    ]))

    await miro.board.ui.closeModal()
}

const getContentPreview = (content) => {
    if (content) {
        if (content.length < 20) {
            return content
        } else {
            return content.slice(0, 15) + '...'
        }
    }

    return ''
}

const getTypeInSpaceCase = (type) => type?.split('_').join(' ')

const getExistingConnectionListItem = (connection, dataItem) => {
    const listItem = document.createElement('li')
    const button = document.createElement('button')
    const itemText = `Remove connection ${connection.is_start ? "to" : "from"}
        ${getTypeInSpaceCase(connection.connectionItem.type)}
        (${getContentPreview(connection.connectionItem.content)})`
    button.textContent = itemText
    button.addEventListener('click', () => onRemoveConnection(connection.id, connection.connectionItem, dataItem))
    listItem.appendChild(button)

    return listItem
}

const getNewConnectionListItem = (currentItem, connectionItem) => {
    const listItem = document.createElement('li')
    const button = document.createElement('button')
    const itemText = `Add connection to ${getTypeInSpaceCase(connectionItem.type)}
        (${getContentPreview(connectionItem.content)})`
    button.textContent = itemText
    button.addEventListener('click', () => onAddConnection(currentItem, connectionItem))
    listItem.appendChild(button)

    return listItem
}

fetchModalData().then(async (data) => {
    title.textContent = data.title
    const currentItem = await miro.board.getById(data.item.id)
    const existingConnections = await currentItem.getConnectors()

    /* Existing Connection Type
        id: string
        is_start: boolean
        item_type: 'sticky_note' | 'text'
        item_content: string
    */

    const existingConnectionData = await Promise.all(existingConnections.map(async (connection) => {
        const isStart = connection.start.item === data.item.id
        const connectionItem = await miro.board.getById(isStart ? connection.end.item : connection.start.item)

        return ({
            id: connection.id,
            is_start: isStart,
            connectionItem: connectionItem,
        })
    }))

    const existingConnectionListItems = existingConnectionData.map(connection =>
        getExistingConnectionListItem(connection, data.item)
    )

    const existingConnectionList = document.querySelector('#connections-form-existing-connections-list')

    if (existingConnectionListItems.length) {
        existingConnectionListItems.forEach(item => existingConnectionList.appendChild(item))
        noExistingConnectionsMessage.remove()
    }

    const connectableItems = await Promise.all(
        [miro.board.get({ type: 'sticky_note' }), miro.board.get({ type: 'text' })]
    )

    const existingConnectionIds = existingConnections.map((connection) => connection.id)

    const newConnections = connectableItems.flat(1).filter(item => {
        if (item.id === data.item.id) {
            return false
        }

        if (existingConnectionIds.length && item.connectorIds.length) {
            return item.connectorIds.filter(
                connectorId => existingConnectionIds.includes(connectorId)
            ).length === 0
        }

        return true
    })

    const newConnectionListItems = newConnections.map(connection =>
        getNewConnectionListItem(data.item, connection)
    )

    const newConnectionsList = document.querySelector('#connections-form-new-connections-list')

    if (newConnectionListItems.length) {
        newConnectionListItems.forEach(item => newConnectionsList.appendChild(item))
        noNewConnectionsMessage.remove()
    }
})