export function formatMetaValue(key, value) {
    if (!value) return "";

    if (typeof value === "string") {
        const d = new Date(value);
        if (isNaN(d)) return value;

        const pad = (n) => String(n).padStart(2, "0");

        return (
            `${d.getUTCFullYear()}-` +
            `${pad(d.getUTCMonth() + 1)}-` +
            `${pad(d.getUTCDate())} ` +
            `${pad(d.getUTCHours())}:` +
            `${pad(d.getUTCMinutes())}:` +
            `${pad(d.getUTCSeconds())} (UTC)`
        );
    }

    if (key === "totalTime") {
        const minutes = Number(value);
        if (!Number.isFinite(minutes)) return "";

        const h = Math.floor(minutes / 60);
        const m = minutes % 60;

        return h > 0
            ? `${h}h ${m}m (${minutes} min)`
            : `${minutes} min`;
    }

    if (typeof value === "object") {
        const {
            year,
            month,
            day,
            hour = 0,
            minute = 0,
            second = 0,
            offset = 0,
        } = value;

        if (!year || !month || !day) return "";

        const pad = (n) => String(n).padStart(2, "0");

        return (
            `${year}-${pad(month)}-${pad(day)} ` +
            `${pad(hour)}:${pad(minute)}:${pad(second)} ` +
            `(UTC${offset >= 0 ? "+" : ""}${offset})`
        );
    }

    return String(value);
}