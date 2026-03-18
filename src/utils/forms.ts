
export function parseFloatFromForm(formData: FormDataEntryValue | null): number | null {
    if (typeof formData === 'string') {
        const parsed = parseFloat(formData);

        if (!isNaN(parsed)) {
            return parsed;
        }
    }

    return null;
}
