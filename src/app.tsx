import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Tag, type Item } from '@mirohq/websdk-types';
import SampleItems from '@data/sample-items.json';
import { HierarchyBoard } from '@components/hierarchy';
import { buildHierarchy } from '@utils/hierarchy-builder';
import { TopLevelItem } from '@models/item';

async function listBoardItems(): Promise<Item[]> {
  return miro.board.get();
  // return SampleItems as Item[];
}

const navigableItemTypes = ['sticky_note', 'frame', 'text'];

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

  const hierarchyItems = React.useMemo(() => {
    return items.filter(item => navigableItemTypes.includes(item.type));
  }, [items]);

  const tagRecord = React.useMemo(() => {
    return items
      .filter(item => item.type === 'tag')
      .reduce(
        (acc, item) => {
          if (item.type === 'tag') {
            acc[item.id] = item as Tag;
          }

          return acc;
        },
        {} as Record<Tag['id'], Tag>
      );
  }, [items]);

  const itemRecord = React.useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc[item.id] = item;

        return acc;
      },
      {} as Record<Item['id'], Item>
    );
  }, [items]);

  const hierarchyBoard = React.useMemo(() => {

    const topLevelItems = hierarchyItems.filter(item => {
      return !(item as TopLevelItem).parentId;
    });

    const children = topLevelItems.map(item =>
      buildHierarchy(item, { tagRecord, itemRecord })
    );

    const hierarchyRoot = {
      id: 'board',
      label: 'Board',
      type: 'board',
      children,
    };

    return hierarchyRoot;
  }, [tagRecord, itemRecord]);


  return (
    <div className="a11ywb-app-container">
      <h1 className="a11ywb-app-title">
        List of Navigable Items (count: {hierarchyItems.length})
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
