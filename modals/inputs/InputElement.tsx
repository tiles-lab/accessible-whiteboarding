import React, { useState } from 'react';
import { ColorOptions } from './ColorOptions';
import { RichTextInput } from './RichTextInput';
import type { AddModalProperties, EditModalProperties } from '../../src/models/modals';
import { Frame } from '@mirohq/websdk-types';

type AddField =
  | NonNullable<AddModalProperties['frameFields']>[number]
  | NonNullable<AddModalProperties['stickyNoteFields']>[number]
  | NonNullable<AddModalProperties['textFields']>[number];

type EditField = EditModalProperties['fields'][number];

type Field = AddField | EditField;

type InputElementProps = {
  field: Field;
  parentFrames?: Frame[];
};

const getReadableFieldName = (fieldName: string): string => {
  const childProperty = fieldName.split('.').slice(-1)[0];
  const spacedValue = childProperty.replace(/([A-Z])/g, ' $1').trim();

  return spacedValue;
};

export const InputElement = (props: InputElementProps): React.ReactElement | null => {
  const { field, parentFrames } = props;
  const currentValue =
    'currentValue' in field ? (field.currentValue as string | undefined) : undefined;
  const [colorEnabled, setColorEnabled] = useState(Boolean(currentValue));

  const required = field.required ?? false;
  const readableFieldName = getReadableFieldName(field.fieldName);

  switch (field.fieldType) {
    case 'color_map':
      return (
        <label className="ally-wb-edit-form-label">
          <span className="ally-wb-edit-form-label-text">{readableFieldName}</span>
          <select name={field.fieldName} id={field.fieldName} required={required}>
            <ColorOptions currentColor={currentValue ?? ''} />
          </select>
        </label>
      );

    case 'color':
      if (!Object.hasOwn(field, 'required')) {
        return (
          <div>
            <label className="toggle-color-input">
              <input
                type="checkbox"
                defaultChecked={Boolean(currentValue)}
                onChange={(e) => setColorEnabled(e.target.checked)}
              />
              Add {readableFieldName}
            </label>
            <label
              className={`ally-wb-edit-form-label ${colorEnabled ? '' : 'ally-wb-hidden'} color-input-label`}
            >
              <span className="ally-wb-edit-form-label-text">{field.fieldName}</span>
              <input
                disabled={!colorEnabled}
                type={field.fieldType}
                name={field.fieldName}
                id={field.fieldName}
                defaultValue={currentValue}
                {...field.inputProps}
              />
            </label>
          </div>
        );
      }
    // falls through to 'parent' when required is present

    // eslint-disable-next-line no-fallthrough
    case 'parent':
      return (
        <label className="ally-wb-edit-form-label ally-wb-parent-input">
          <span className="ally-wb-edit-form-label-text">{readableFieldName}</span>
          <select name={field.fieldName} id={field.fieldName} required={required}>
            <option value="">Board</option>
            {parentFrames?.map((parent) => (
              <option value={parent.id}>{parent.title}</option>
            ))}
          </select>
        </label>
      );

    case 'rich_text':
      return (
        <RichTextInput
          fieldName={field.fieldName}
          required={required}
          currentValue={currentValue}
          label={readableFieldName}
        />
      );

    default:
      return (
        <label className="ally-wb-edit-form-label">
          <span className="ally-wb-edit-form-label-text">{readableFieldName}</span>
          <input
            type={field.fieldType}
            required={required}
            name={field.fieldName}
            id={field.fieldName}
            defaultValue={currentValue}
            {...field.inputProps}
          />
        </label>
      );
  }
};
