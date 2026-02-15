import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { type Item } from '@mirohq/websdk-types';
import SampleItemsConceptMap from '@data/sample-items-concept-map.json';
import { HierarchyBoard } from '@components/hierarchy';
import { buildConnectorHierarchy } from '@utils/record-builder';
import { ItemNames } from '@models/item';

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
      const updatedItem = window.sessionStorage.getItem('updated_miro_item')
      if (updatedItem) {
        try {
          const parsedItem: Item = JSON.parse(updatedItem)

          if (parsedItem) {
            setItems([...items.filter(item => item.id !== parsedItem.id), parsedItem])
          }
        } catch (e) {
          console.error('Error parsing updated item: ', e)
        }
      }
    })

    miro.board.ui.on('items:create', async event => {
      setItems([...items, ...event.items]);
    });
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
