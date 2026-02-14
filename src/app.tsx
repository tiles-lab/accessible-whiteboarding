import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { type Item } from '@mirohq/websdk-types';
import SampleItemsConceptMap from '@data/sample-items-concept-map.json';
import { HierarchyBoard } from '@components/hierarchy';
import { buildConnectorHierarchy } from '@utils/record-builder';

async function listBoardItems(): Promise<Item[]> {
  let items: Item[];

  try {
    items = await window.miro.board.get();
  } catch (err) {
    items = SampleItemsConceptMap as Item[];
  }

  return items;
}

const navigableItemTypes = ['sticky_note', 'frame', 'text', 'connector'];

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

    miro.board.ui.on('items:create', async event => {
      setItems([...items, ...event.items]);
    });
  }, [items]);

  const navigableItems: Item[] = React.useMemo(() => {
    return items.filter(item => navigableItemTypes.includes(item.type));
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
    <div className="a11ywb-app-container">
      <h1 className="a11ywb-app-title">
        List of Navigable Items (count: {navigableItems.length})
      </h1>

      <HierarchyBoard
        type={hierarchyBoard.type}
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
