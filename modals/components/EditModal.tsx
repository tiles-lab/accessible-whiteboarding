import { EditModalProperties } from '../../src/models/modals';
import { Connector, Frame, Group, Item, Tag } from '@mirohq/websdk-types';
import { FormEvent, useEffect, useState } from 'react';
import { InputElement } from '../inputs/InputElement';

type EditModalProps = {
  handleError: (message: string, error: unknown) => void;
  handleToast: (message: string) => void;
  modalData: EditModalProperties;
};

type ItemWithParent = Exclude<Item, Connector | Group | Tag>;

export const EditModal = (props: EditModalProps) => {
  const { handleError, handleToast, modalData } = props;
  const [resetKey, setResetKey] = useState(0);
  const [parents, setParents] = useState<Frame[]>([]);

  const FORM_ID = 'edit-form';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const item = (await miro.board.getById(modalData.item.id)) as ItemWithParent &
        Record<string, unknown>;
      const formFieldNames = formData.keys();

      for (const formFieldName of formFieldNames) {
        const formFieldNameChildren = formFieldName.split('.');
        const lastFieldName = formFieldNameChildren.pop()!;
        let currentFieldName: Record<string, unknown> = item;

        for (const fieldNameChild of formFieldNameChildren) {
          if (!currentFieldName[fieldNameChild]) {
            currentFieldName[fieldNameChild] = {};
          }
          currentFieldName = currentFieldName[fieldNameChild] as Record<string, unknown>;
        }

        currentFieldName[lastFieldName] = formData.get(formFieldName);
      }

      const parentId = formData.get('parentId');

      if (parentId !== modalData.item?.parentId && item) {
        const existingParentId: string = modalData.item?.parentId ?? '';

        if (existingParentId) {
          const existingParent = (await miro.board.getById(existingParentId)) as Frame;
          await existingParent.remove(item);
          await item.sync();
        }

        const parentFrame = (await miro.board.getById(parentId as string)) as Frame;
        item.x = parentFrame.x + 1;
        item.y = parentFrame.y + 1;
        await item.sync();
        await parentFrame.add(item);

        window.sessionStorage.setItem(
          'updated_miro_items',
          JSON.stringify([
            {
              ...parentFrame,
              childrenIds: [...parentFrame.childrenIds, item.id],
            },
            {
              ...item,
              parentId: parentFrame.id,
            },
          ]),
        );
      } else {
        await item.sync();
        window.sessionStorage.setItem('updated_miro_items', JSON.stringify([item]));
      }

      handleToast('Item edited');
    } catch (error) {
      handleError('Error editing item', error);
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
        {modalData.fields.map((field) => (
          <InputElement
            key={`${field.fieldName}-${resetKey}`}
            field={field}
            parentFrames={parents}
          />
        ))}
      </div>

      <div className="ally-wb-edit-form-buttons">
        <button type="submit" form={FORM_ID}>
          Edit
        </button>
        <button type="reset" form={FORM_ID} onClick={() => setResetKey((k) => k + 1)}>
          Reset
        </button>
      </div>
    </form>
  );
};
