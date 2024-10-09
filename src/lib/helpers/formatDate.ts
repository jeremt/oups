export function formatDate(date: Date) {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    return `${d < 10 ? '0' + d : d}/${m < 10 ? '0' + m : m}/${date.getFullYear()}`;
}
