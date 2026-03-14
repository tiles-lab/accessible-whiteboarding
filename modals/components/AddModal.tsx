import { AddModalProperties } from '../../src/models/modals';
import { Frame, ItemType, StickyNoteColor } from '@mirohq/websdk-types';
import { FormEvent, useEffect, useState } from 'react';
import { InputElement } from '../inputs/InputElement';

type AddModalProps = {
  handleError: (message: string, error: unknown) => void;
  handleToast: (message: string) => void;
  modalData: AddModalProperties;
};

const getFieldDataType = (data: AddModalProperties): ItemType => {
  if ('frameFields' in data) {
    return 'frame';
  }

  if ('stickyNoteFields' in data) {
    return 'sticky_note';
  }

  if ('textFields' in data) {
    return 'text';
  }

  return '';
};

export const AddModal = (props: AddModalProps) => {
  const { handleError, handleToast, modalData } = props;
  const [parents, setParents] = useState<Frame[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const dataType: ItemType = getFieldDataType(modalData);

  const FORM_ID = 'add-form';

  const fieldData = modalData.frameFields ?? modalData.stickyNoteFields ?? modalData.textFields;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };

  const onSubmit = async (formData: FormData) => {
    try {
      let newItem;

      if (dataType === 'frame') {
        await miro.board.createFrame({
          title: formData.get('title') as string,
          style: {
            fillColor: (formData.get('style.fillColor') as string) ?? 'transparent',
          },
          width: +(formData.get('width') as string),
          height: +(formData.get('height') as string),
        });
      }

      if (dataType === 'sticky_note') {
        newItem = await miro.board.createStickyNote({
          content: formData.get('content') as string,
          style: {
            fillColor: formData.get('style.fillColor') as StickyNoteColor,
          },
        });
      }

      if (dataType === 'text') {
        newItem = await miro.board.createText({
          content: formData.get('content') as string,
          parentId: formData.get('parentId') as string,
        });
      }

      const parentId = formData.get('parentId');

      if (parentId && newItem) {
        const parentFrame = (await miro.board.getById(parentId as string)) as Frame;
        newItem.x = parentFrame.x + 1;
        newItem.y = parentFrame.y + 1;
        await newItem.sync();
        await parentFrame.add(newItem);

        window.sessionStorage.setItem(
          'updated_miro_items',
          JSON.stringify([
            {
              ...parentFrame,
              childrenIds: [...parentFrame.childrenIds, newItem.id],
            },
            {
              ...newItem,
              parentId: parentFrame.id,
            },
          ]),
        );
      }

      handleToast('Item added');
    } catch (error) {
      handleError('Error adding item', error);
    }
  };

  const fetchParentIds = async () => {
    try {
      const frames = await miro.board.get({ type: 'frame' });
      setParents(frames);
    } catch (error) {
      handleError('Error getting frames', error);
    }
  };

  useEffect(() => {
    fetchParentIds();
  }, []);

  return (
    <form id={FORM_ID} onSubmit={handleSubmit} className="ally-wb-edit-form-form">
      <div className="ally-wb-edit-form-fields">
        {fieldData?.map((field) => (
          <InputElement
            key={`${field.fieldName}-${resetKey}`}
            field={field}
            parentFrames={parents}
          />
        ))}
      </div>

      <div className="ally-wb-edit-form-buttons">
        <button type="submit" form={FORM_ID}>
          Add
        </button>
        <button type="reset" form={FORM_ID} onClick={() => setResetKey((k) => k + 1)}>
          Reset
        </button>
      </div>
    </form>
  );
};
