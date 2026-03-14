import { EditModalProperties } from '../../src/models/modals';
import { Item } from '@mirohq/websdk-types';
import { FormEvent, useState } from 'react';
import { InputElement } from '../inputs/InputElement';

type EditModalProps = {
  handleError: (message: string, error: unknown) => void;
  handleToast: (message: string) => void;
  modalData: EditModalProperties;
};

export const EditModal = (props: EditModalProps) => {
  const { handleError, handleToast, modalData } = props;
  const [resetKey, setResetKey] = useState(0);

  const FORM_ID = 'edit-form';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };

  const onSubmit = async (formData: FormData) => {
    try {
      const item = (await miro.board.getById(modalData.item.id)) as Item & Record<string, unknown>;
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

      await item.sync();
      window.sessionStorage.setItem('updated_miro_items', JSON.stringify([item]));
      handleToast('Item edited');
    } catch (error) {
      handleError('Error editing item', error);
    }
  };

  return (
    <form id={FORM_ID} onSubmit={handleSubmit} className="ally-wb-edit-form-form">
      <div className="ally-wb-edit-form-fields">
        {modalData.fields.map((field) => (
          <InputElement key={`${field.fieldName}-${resetKey}`} field={field} />
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
