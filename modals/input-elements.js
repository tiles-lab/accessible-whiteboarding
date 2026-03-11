import { getColorMap } from "./color-options"

const getReadableFieldName = (fieldName) => {
    const childProperty = fieldName.split('.').slice(-1)[0]
    const spacedValue = childProperty.replace(/([A-Z])/g, ' $1').trim()

    return spacedValue
}

const getAdditionalInputProps = (inputProps) => {
    let properties = ``

    if (inputProps) {
        for (const [key, value] of Object.entries(inputProps)) {
            properties += `${key}="${value}"`
        }
    }

    return properties
}

export const getInputElement = (field) => {
    const required = field.required ? 'required="true"' : ''
    const readableFieldName = getReadableFieldName(field.fieldName)
    const value = field.currentValue ? `value="${field.currentValue}"` : ''

    switch (field.fieldType) {
        case 'color_map':
            return (
                `<label class="ally-wb-edit-form-label">
                    <span class="ally-wb-edit-form-label-text">${readableFieldName}</span>
  
                    <select
                        name="${field.fieldName}"
                        id="${field.fieldName}"
                        ${required}
                    >
                    ${getColorMap(field.currentValue ?? '').join()}
                    </select>
                </label>`
            )
        case 'color':
            if (!Object.hasOwn(field, 'required')) {
                return (
                    `<div>
                        <label class="toggle-color-input">
                            <input type="checkbox" ${Boolean(field.currentValue) ? 'checked' : ''}" />
                            Add ${readableFieldName}
                        </label>

                        <label class="ally-wb-edit-form-label ${Boolean(field.currentValue) ? '' : 'ally-wb-hidden'} color-input-label">
                            <span class="ally-wb-edit-form-label-text">${field.fieldName}</span>
                            <input
                                ${Boolean(field.currentValue) ? '' : 'disabled'}
                                type="${field.fieldType}"
                                name="${field.fieldName}"
                                id="${field.fieldName}"
                                ${value}
                                ${getAdditionalInputProps(field.inputProps)}
                            />
                        </label>
                    </div>
                    `
                )
            }
        case 'parent':
            return (
                `<label class="ally-wb-edit-form-label" class="ally-wb-parent-input">
                <span class="ally-wb-edit-form-label-text">${readableFieldName}</span>
                    <select name="${field.fieldName}" id="${field.fieldName}" ${required}>
                        <option value="">Board</option>
                    </select>
                </label>`
            )
        default:
            return (
                `<label class="ally-wb-edit-form-label">
                    <span class="ally-wb-edit-form-label-text">${readableFieldName}</span>
                    <input
                        type="${field.fieldType}"
                        ${required}
                        name="${field.fieldName}"
                        id="${field.fieldName}"
                        ${value}
                        ${getAdditionalInputProps(field.inputProps)}
                    />
                </label>`
        )
    }
}