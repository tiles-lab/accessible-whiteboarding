import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { type Item } from '@mirohq/websdk-types';
import SampleItemsConceptMap from '@data/sample-items-concept-map.json';
import { HierarchyBoard } from '@components/hierarchy';
import { buildConnectorHierarchy } from '@utils/record-builder';
import { ItemNames } from '@models/item';
import { addData } from '@utils/add-data';

async function listBoardItems(): Promise<Item[]> {
  let items: Item[];

  try {
    items = await window.miro.board.get();
  } catch (err) {
    items = SampleItemsConceptMap as Item[];
  }

  return items;
}

const navigableItemTypes = [ItemNames.stickyNote, ItemNames.frame, ItemNames.text, ItemNames.connector];

const App: React.FC = () => {

  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    console.log('Listing board items...');
    listBoardItems().then(boardItems => {
      setItems(boardItems);
      console.log(`Found ${boardItems.length}`);
    });
  }, []);

  React.useEffect(() => {
    if (!window.miro) {
      return;
    }

    window.addEventListener('storage', () => {
      const updatedItems = window.sessionStorage.getItem('updated_miro_items')
      if (updatedItems) {
        try {
          const parsedItems: Item[] = JSON.parse(updatedItems)
          const parsedIds: Item['id'][] = parsedItems.map(item => item.id)

          if (parsedItems) {
            setItems([...items.filter(item => !parsedIds.includes(item.id)), ...parsedItems])
          }
        } catch (e) {
          console.error('Error parsing updated item: ', e)
        }
      }
    })

    miro.board.ui.on('items:create', async event => {
      setItems([...items, ...event.items]);
    });

    miro.board.ui.on('items:delete', async event => {
      setItems(items.filter(item => item.id !== event.items?.[0]?.id))
    })
  }, [items]);

  const navigableItems: Item[] = React.useMemo(() => {
    return items.filter(item => navigableItemTypes.includes(item.type as ItemNames));
  }, [items]);

  const hierarchyBoard = React.useMemo(() => {
    const children = buildConnectorHierarchy(items);

    const hierarchyRoot = {
      id: 'board',
      label: 'Board',
      type: 'board',
      children,
    };

    return hierarchyRoot;
  }, [navigableItems]);

  return (
    <main className="a11ywb-app-container">
      <h1 className="a11ywb-app-title">
        List of Navigable Items (count: {navigableItems.length})
      </h1>

      <HierarchyBoard
        type={hierarchyBoard.type as ItemNames}
        label={hierarchyBoard.label}
        children={hierarchyBoard.children}
      />

      <h2>Add Item to Board</h2>
      <button type="button" onClick={() => addData({
        title: "Add Frame",
        frameFields: [
          {
            fieldName: 'title',
            fieldType: 'text',
            required: true
          },
          {
            fieldName: 'style.fillColor',
            fieldType: 'color'
          },
          {
            fieldName: 'width',
            fieldType: 'number',
            required: true,
            inputProps: {
              value: 700
            }
          },
          {
            fieldName: 'height',
            fieldType: 'number',
            required: true,
            inputProps: {
              value: 500
            }
          }
        ]
      })}>Add Frame</button>

      <button type="button" onClick={() => addData({
        title: "Add Sticky Note",
        stickyNoteFields: [
          {
            fieldName: 'content',
            fieldType: 'text',
            required: true
          },
          {
            fieldName: 'style.fillColor',
            fieldType: 'color_map'
          }
        ]
      })}>Add Sticky Note</button>

      <button type="button" onClick={() => addData({
        title: "Add Text",
        textFields: [
          {
            fieldName: 'content',
            fieldType: 'text',
            required: true
          }
        ]
      })}>Add Text</button>
    </main>
  );
};

const container = document.getElementById('a11ywb-root');
const root = container ? createRoot(container) : null;

function render() {
  root?.render(<App />);
}

render();

// HMR support
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    render();
  });
}
