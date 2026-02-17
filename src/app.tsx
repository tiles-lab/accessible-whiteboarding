import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { type Item } from '@mirohq/websdk-types';
import SampleItemsConceptMap from '@data/sample-items-concept-map.json';
import { HierarchyBoard } from '@components/hierarchy';
import { buildConnectorHierarchy } from '@utils/record-builder';
import { ItemType } from '@models/item';

const fallbackData = SampleItemsConceptMap as Item[];

async function listBoardItems(): Promise<Item[]> {
  return new Promise((resolve) => {
    miro.board.get()
      .then(items => resolve(items))
      .catch(() => resolve(fallbackData));
    
    setTimeout(() => resolve(fallbackData), 50);
  });
}

const navigableItemTypes = [ItemType.StickyNote, ItemType.Frame, ItemType.Text, ItemType.Connector];

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
    miro.board.ui.on('items:create', async event => {
      setItems([...items, ...event.items]);
    });
  }, [items]);

  const navigableItems: Item[] = React.useMemo(() => {
    return items.filter(item => navigableItemTypes.includes(item.type as ItemType));
  }, [items]);

  const hierarchyBoard = React.useMemo(() => {
    const children = buildConnectorHierarchy(navigableItems);

    const hierarchyRoot = {
      id: 'board',
      label: 'Board',
      type: 'board',
      children,
    };

    return hierarchyRoot;
  }, [navigableItems]);

  return (
    <div className="a11ywb-app-container">
      <h1 className="a11ywb-app-title">
        List of Navigable Items (count: {navigableItems.length})
      </h1>

      <HierarchyBoard
        type={hierarchyBoard.type as ItemType}
        label={hierarchyBoard.label}
        children={hierarchyBoard.children}
      />
    </div>
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
