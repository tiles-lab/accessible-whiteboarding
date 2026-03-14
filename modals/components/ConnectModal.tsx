import { ConnectModalProperties } from '../../src/models/modals';
import { Connector, Group, Item, StickyNote, Tag } from '@mirohq/websdk-types';
import { useEffect, useState } from 'react';

type ConnectModalProps = {
  handleError: (message: string, error: unknown) => void;
  handleToast: (message: string) => void;
  modalData: ConnectModalProperties;
};

type ItemWithoutConnector = Exclude<Item, Connector | Group | Tag>;

type ConnectorWithConnectionData = {
  connector: Connector;
  is_start: boolean;
  connectionItem: ItemWithoutConnector;
};

export const ConnectModal = (props: ConnectModalProps) => {
  const { handleError, handleToast, modalData } = props;
  const [existingConnections, setExistingConnections] = useState<ConnectorWithConnectionData[]>([]);
  const [connectableItems, setConnectableItems] = useState<ItemWithoutConnector[]>([]);
  const [currentItem, setCurrentItem] = useState<ItemWithoutConnector>();

  const getContentPreview = (content: string) => {
    if (content) {
      if (content.length < 20) {
        return content;
      } else {
        return content.slice(0, 15) + '...';
      }
    }

    return '';
  };

  const getTypeInSpaceCase = (type: Item['type']) => type?.split('_').join(' ');

  const getItemText = (isStart: boolean, item: Item) => {
    let text = 'Remove connection';

    if (isStart) {
      text += 'to';
    } else {
      text += 'from';
    }

    text += ' ' + getTypeInSpaceCase(item.type);

    if ('content' in item) {
      text += getContentPreview(item.content);
    }

    return text;
  };

  const onAddConnection = async (
    startItem: ItemWithoutConnector,
    endItem: ItemWithoutConnector,
  ) => {
    try {
      const connector = await miro.board.createConnector({
        start: {
          item: startItem.id,
          snapTo: 'right',
        },
        end: {
          item: endItem.id,
          snapTo: 'left',
        },
      });

      window.sessionStorage.setItem(
        'updated_miro_items',
        JSON.stringify([
          connector,
          {
            ...startItem,
            connectorIds: startItem?.connectorIds
              ? [...startItem.connectorIds, connector.id]
              : [connector.id],
          },
          {
            ...endItem,
            connectorIds: endItem?.connectorIds
              ? [...endItem.connectorIds, connector.id]
              : [connector.id],
          },
        ]),
      );

      handleToast('Connection added');
    } catch (error) {
      handleError('Error adding connection', error);
    }
  };

  const onRemoveConnection = async (connector: Connector, connectionItem: ItemWithoutConnector) => {
    try {
      await miro.board.remove(connector);

      window.sessionStorage.setItem(
        'updated_miro_items',
        JSON.stringify([
          connector,
          {
            ...connectionItem,
            connectorIds: connectionItem?.connectorIds?.filter((id) => id !== connector.id),
          },
          {
            ...currentItem,
            connectorIds: currentItem?.connectorIds?.filter((id) => id !== connector.id),
          },
        ]),
      );

      handleToast('Connection removed');
    } catch (error) {
      handleError('Error removing connection', error);
    }
  };

  const fetchExistingConnections = async () => {
    if (currentItem) {
      try {
        const response = await currentItem.getConnectors();

        const modifiedResponse = await Promise.all(
          response.map(async (connector): Promise<ConnectorWithConnectionData> => {
            const isStart = connector?.start?.item === currentItem.id;

            const connectorItemId: string =
              (isStart ? connector?.end?.item : connector?.start?.item) ?? '';

            const connectionItem = await miro.board.getById(connectorItemId);

            return {
              connector: connector,
              is_start: isStart,
              connectionItem: connectionItem as ItemWithoutConnector,
            };
          }),
        );

        setExistingConnections(modifiedResponse);
      } catch (error) {
        handleError('Error getting existing connections', error);
      }
    }
  };

  const fetchConnectableItems = async () => {
    try {
      const response = await Promise.all([
        miro.board.get({ type: 'sticky_note' }),
        miro.board.get({ type: 'text' }),
      ]);

      const existingConnectionIds = existingConnections.map(
        (connection) => connection.connector.id,
      );

      const newConnections = response.flat(1).filter((item) => {
        if (item.id === currentItem?.id) {
          return false;
        }

        if (existingConnectionIds.length && item?.connectorIds?.length) {
          return (
            item.connectorIds.filter((connectorId) => existingConnectionIds.includes(connectorId))
              .length === 0
          );
        }

        return true;
      });

      setConnectableItems(newConnections);
    } catch (error) {
      handleError('Error getting items to connect to', error);
    }
  };

  const fetchCurrentItem = async () => {
    try {
      const response = await miro.board.getById(modalData.item.id);

      setCurrentItem(response as ItemWithoutConnector);
    } catch (error) {
      handleError('Error getting current item', error);
    }
  };

  useEffect(() => {
    fetchExistingConnections();
  }, [currentItem]);

  useEffect(() => {
    fetchConnectableItems();
  }, [existingConnections]);

  useEffect(() => {
    fetchCurrentItem();
  }, []);

  return (
    <div>
      <h3>Remove Existing Connections</h3>

      {existingConnections?.length ? (
        <ul>
          {existingConnections.map((connection) => {
            return (
              <li key={connection.connector.id}>
                <button
                  onClick={() =>
                    onRemoveConnection(connection.connector, connection.connectionItem)
                  }
                >
                  {getItemText(connection.is_start, connection.connectionItem)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>There are no existing connections.</p>
      )}

      <h3>Add New Connections</h3>

      {connectableItems?.length ? (
        <ul>
          {currentItem &&
            connectableItems.map((item) => {
              const contentPreview = 'content' in item ? getContentPreview(item?.content) : '';
              return (
                <li key={item.id}>
                  <button onClick={() => onAddConnection(currentItem, item)}>
                    Add connection to {getTypeInSpaceCase(item.type)} ({contentPreview})
                  </button>
                </li>
              );
            })}
        </ul>
      ) : (
        <p>There are no items available to connect.</p>
      )}
    </div>
  );
};
