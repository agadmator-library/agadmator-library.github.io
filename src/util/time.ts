let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
if (!timeZone) {
    timeZone = "UTC"
}
const dateTimeFormat = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
})

const dateFormat = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
})


export function prettyDate(date: Date): string {
    return dateFormat.format(date)
}

export function prettyDateTime(date: Date): string {
    return dateTimeFormat.format(date)
}