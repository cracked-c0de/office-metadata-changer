export const META_MAP = {
    title: ["title", "dc:title"],
    subject: ["subject", "dc:subject"],
    creator: ["creator", "dc:creator"],
    description: ["description", "dc:description"],

    keywords: ["keywords", "cp:keywords"],
    category: ["category", "cp:category"],
    lastModifiedBy: ["lastModifiedBy", "cp:lastModifiedBy"],

    // dates (ISO strings)
    created: [
        "created",
        "dcterms:created",
        "createdDate",
    ],
    modified: [
        "modified",
        "dcterms:modified",
        "modifiedDate",
    ],

    // app.xml
    totalTime: ["totalTime"],
};

export function normalizeMeta(raw = {}) {
    const result = {};

    for (const key in META_MAP) {
        const aliases = META_MAP[key];

        for (const alias of aliases) {
            if (raw[alias] !== undefined) {
                const v = raw[alias];

                // XML node → take _
                if (typeof v === "object" && v !== null && "_" in v) {
                    result[key] = v._;
                } else {
                    result[key] = v;
                }
                break;
            }
        }
    }

    return result;
}
