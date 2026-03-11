// Copied from Miro's StickyNoteColor enum
const stickyNoteColors = {
    LightYellow: "light_yellow",
    Yellow: "yellow",
    Orange: "orange",
    Red: "red",
    LightPink: "light_pink",
    Pink: "pink",
    Blue: "blue",
    Violet: "violet",
    LightBlue: "light_blue",
    DarkBlue: "dark_blue",
    Cyan: "cyan",
    DarkGreen: "dark_green",
    LightGreen: "light_green",
    Green: "green",
    Gray: "gray",
    Black: "black"
}

export const getColorMap = (currentColor) => {
    const availableColors = Object.values(stickyNoteColors)

    return availableColors.map((color) => {
        const isSelected = color === currentColor ? 'selected' : ''
        const lowercaseColorName = color ? color.split('_').join(' ') : 'transparent'
        const colorName = lowercaseColorName.charAt(0).toUpperCase() + lowercaseColorName.slice(1)

        return (
            `<option
                value="${color}"
                ${isSelected}
                class="ally-wb-edit-form-color-option"
            >
                ${colorName}
            </option>`
        )   
    })
}
