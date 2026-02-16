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

    switch (field.fieldType) {
        case 'color_map':
            return (
                `<label class="ally-wb-edit-form-label">
                    <span class="ally-wb-edit-form-label-text">${getReadableFieldName(field.fieldName)}</span> 
  
                    <select
                        name="${field.fieldName}"
                        id="${field.fieldName}"
                        ${required}
                    >
                    ${getColorMap(field.currentValue ?? '').join()}
                    </select>
                </label>`
            )
        default:
            const value = field.currentValue ? `value="${field.currentValue}"` : ''

            return (
                `<label class="ally-wb-edit-form-label">
                    <span class="ally-wb-edit-form-label-text">${field.fieldName}</span>
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