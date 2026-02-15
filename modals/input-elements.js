import { getColorMap } from "./color-options"

const getReadableFieldName = (fieldName) => {
    const childProperty = fieldName.split('.').slice(-1)[0]
    const spacedValue = childProperty.replace(/([A-Z])/g, ' $1').trim()

    return spacedValue
}

export const getInputElement = (field) => {
    switch (field.fieldType) {
        case 'color':
            return (
                `<label class="ally-wb-edit-form-label">
                    <span class="ally-wb-edit-form-label-text">${getReadableFieldName(field.fieldName)}</span> 
  
                    <select
                        name="${field.fieldName}"
                        id="${field.fieldName}"
                        required="${field.required ? true : ''}"
                    >
                    ${getColorMap(field.currentValue).join()}
                    </select>
                </label>`
            )
        default:
            return (
                `<label class="ally-wb-edit-form-label">
                    <span class="ally-wb-edit-form-label-text">${field.fieldName}</span>
                    <input
                        type="${field.fieldType}"
                        required="${field.required ? true : ''}"
                        name="${field.fieldName}"
                        id="${field.fieldName}"
                        value="${field.currentValue}"
                    />
                </label>`
        )
    }
}