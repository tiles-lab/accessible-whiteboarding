import { MoveModalProperties } from '../../src/models/modals';
import { Connector, Frame, Group, Item, Tag } from '@mirohq/websdk-types';
import { useEffect, useState } from 'react';
import { notifyBoardUpdate } from '../../src/utils/board-sync';

type MoveModalProps = {
  handleError: (message: string, error: unknown) => void;
  handleToast: (message: string) => void;
  modalData: MoveModalProperties;
};

type ItemWithParent = Exclude<Item, Connector | Group | Tag> & { parentId?: string };

export const MoveModal = (props: MoveModalProps) => {
  const { handleError, handleToast, modalData } = props;
  const [frames, setFrames] = useState<Frame[]>([]);
  const [currentItem, setCurrentItem] = useState<ItemWithParent>();

  const fetchData = async () => {
    try {
      const [fetchedFrames, fetchedItem] = await Promise.all([
        miro.board.get({ type: 'frame' }),
        miro.board.getById(modalData.item.id),
      ]);
      setFrames(fetchedFrames);
      setCurrentItem(fetchedItem as ItemWithParent);
    } catch (error) {
      handleError('Error getting data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const moveToFrame = async (frameId: string) => {
    try {
      const frame = (await miro.board.getById(frameId)) as Frame;
      const item = (await miro.board.getById(modalData.item.id)) as ItemWithParent;

      item.x = frame.x + 1;
      item.y = frame.y + 1;
      await item.sync();
      await frame.add(item);

      notifyBoardUpdate();
      handleToast('Item moved');
    } catch (error) {
      handleError('Error moving item', error);
    }
  };

  const removeFromFrame = async () => {
    try {
      const item = (await miro.board.getById(modalData.item.id)) as ItemWithParent;
      const frame = (await miro.board.getById(item.parentId!)) as Frame;

      await frame.remove(item);

      notifyBoardUpdate();
      handleToast('Item moved');
    } catch (error) {
      handleError('Error moving item', error);
    }
  };

  return (
    <div>
      {currentItem?.parentId && (
        <p id="move-form-move-to-board-container">
          <button type="button" onClick={removeFromFrame}>
            Move to Board
          </button>
        </p>
      )}

      <h3>Move to Frame</h3>

      <ul id="move-form-available-frames-list">
        {frames.length ? (
          frames.map((frame) =>
            currentItem?.parentId === frame.id ? (
              <li key={frame.id}>{frame.title} (Current Location)</li>
            ) : (
              <li key={frame.id}>
                <button type="button" onClick={() => moveToFrame(frame.id)}>
                  Move to {frame.title}
                </button>
              </li>
            ),
          )
        ) : (
          <li>No frames available</li>
        )}
      </ul>
    </div>
  );
};
