// Copied from Miro's StickyNoteColor enum
const stickyNoteColors = {
    Transparent: "",
    Gray: "gray",
    LightYellow: "light_yellow",
    Yellow: "yellow",
    Orange: "orange",
    LightGreen: "light_green",
    Green: "green",
    DarkGreen: "dark_green",
    Cyan: "cyan",
    LightPink: "light_pink",
    Pink: "pink",
    Violet: "violet",
    Red: "red",
    LightBlue: "light_blue",
    Blue: "blue",
    DarkBlue: "dark_blue",
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
