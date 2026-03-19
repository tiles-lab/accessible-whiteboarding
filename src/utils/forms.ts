
export function parseFloatFromForm(formData: FormDataEntryValue | null): number | undefined {
    if (typeof formData === 'string') {
        const parsed = parseFloat(formData);

        if (!isNaN(parsed)) {
            return parsed;
        }
    }

    return undefined;
}
