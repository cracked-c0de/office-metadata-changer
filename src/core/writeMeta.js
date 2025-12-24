import {
    loadZip,
    saveZip,
    writeCoreMeta,
} from "../formats/officeCore.js";

import {
    writeAppMeta,
} from "../formats/officeApp.js";

/**
 * Write metadata to Office file
 *
 * @param {string} inputPath
 * @param {string} format
 * @param {object} meta
 * @param {string} outputPath
 */
export async function writeMeta(inputPath, format, meta, outputPath) {
    if (!outputPath) {
        throw new Error("outputPath is required");
    }

    switch (format) {
        case "docx": {
            // 1️⃣ Load DOCX as ZIP
            const zip = await loadZip(inputPath);

            // 2️⃣ Core properties (core.xml)
            await writeCoreMeta(zip, meta);

            // 3️⃣ App properties (app.xml) ← 🔥 ВАЖНО
            await writeAppMeta(zip, meta);

            // 4️⃣ Save ZIP back to file
            await saveZip(zip, outputPath);
            return;
        }

        default:
            throw new Error(`Format .${format} is not supported`);
    }
}
