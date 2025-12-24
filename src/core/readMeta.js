import * as docx from "../formats/docx.js";
import * as xlsx from "../formats/xlsx.js";
import * as pptx from "../formats/pptx.js";

/**
 * Read metadata from Office file
 *
 * @param {string} file   - file path
 * @param {string} format - file format (docx | xlsx | pptx)
 * @returns {Promise<object>}
 */
export async function readMeta(file, format) {
    switch (format) {
        case "docx":
            // DOCX: core.xml + app.xml (totalTime, etc.)
            return await docx.read(file);

        case "xlsx":
            // XLSX: core.xml only (for now)
            return await xlsx.read(file);

        case "pptx":
            // PPTX: core.xml only (for now)
            return await pptx.read(file);

        default:
            throw new Error(`Format .${format} is not supported`);
    }
}
