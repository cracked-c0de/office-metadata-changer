import {
    loadZip,
    writeCoreMeta,
    saveZip,
    readCoreMeta,
} from "./officeCore.js";

import {
    readAppMeta,
    writeAppMeta,
} from "./officeApp.js";

/**
 * Read metadata from DOCX
 */
export async function read(inputPath) {
    const zip = await loadZip(inputPath);
    const core = await readCoreMeta(zip);
    const app = await readAppMeta(zip);
    return { ...core, ...app };
}

/**
 * Write metadata to DOCX
 */
export async function write(inputPath, meta, outputPath) {
    const zip = await loadZip(inputPath);

    await writeCoreMeta(zip, meta);
    await writeAppMeta(zip, meta);

    await saveZip(zip, outputPath);
}

