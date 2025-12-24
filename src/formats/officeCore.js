import fs from "fs";
import JSZip from "jszip";
import { parseStringPromise, Builder } from "xml2js";
import { OfficeFileError } from "../core/errors.js";

/**
 * Supported Office CORE properties (core.xml ONLY)
 */
export const CORE_FIELDS = {
    title: "dc:title",
    subject: "dc:subject",
    creator: "dc:creator",
    description: "dc:description",
    keywords: "cp:keywords",
    category: "cp:category",
    lastModifiedBy: "cp:lastModifiedBy",
    created: "dcterms:created",
    modified: "dcterms:modified",
};

/* ================= ZIP ================= */

export async function loadZip(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new OfficeFileError("File not found");
    }

    const buf = fs.readFileSync(filePath);
    if (!buf.length) {
        throw new OfficeFileError("File is empty");
    }

    try {
        return await JSZip.loadAsync(buf);
    } catch {
        throw new OfficeFileError("File is not a valid Office document");
    }
}

export async function saveZip(zip, outputPath) {
    const buffer = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync(outputPath, buffer);
}

/* ================= READ ================= */

export async function readCoreMeta(zip) {
    const coreFile = zip.file("docProps/core.xml");
    if (!coreFile) {
        throw new OfficeFileError("core.xml is missing");
    }

    const parsed = await parseStringPromise(await coreFile.async("text"));
    const core = parsed["cp:coreProperties"] || {};

    const meta = {};

    for (const key in CORE_FIELDS) {
        const xmlKey = CORE_FIELDS[key];
        if (!core[xmlKey]) continue;

        const raw = core[xmlKey][0];
        meta[key] =
            typeof raw === "object" && "_" in raw ? raw._ : raw;
    }

    return meta;
}

/* ================= WRITE ================= */

export async function writeCoreMeta(zip, updates = {}) {
    const corePath = "docProps/core.xml";
    const xml = await zip.file(corePath)?.async("text");

    if (!xml) {
        throw new OfficeFileError("core.xml is missing");
    }

    const parsed = await parseStringPromise(xml);
    const core = parsed["cp:coreProperties"];

    // ensure namespaces
    core.$ ||= {};
    core.$["xmlns:cp"] ||= "http://schemas.openxmlformats.org/package/2006/metadata/core-properties";
    core.$["xmlns:dc"] ||= "http://purl.org/dc/elements/1.1/";
    core.$["xmlns:dcterms"] ||= "http://purl.org/dc/terms/";
    core.$["xmlns:dcmitype"] ||= "http://purl.org/dc/dcmitype/";
    core.$["xmlns:xsi"] ||= "http://www.w3.org/2001/XMLSchema-instance";

    for (const key in updates) {
        if (!CORE_FIELDS[key]) continue;

        const xmlKey = CORE_FIELDS[key];

        // dates
        if (key === "created" || key === "modified") {
            const value = updates[key];
            if (typeof value !== "string") continue;

            core[xmlKey] = [
                {
                    _: value,
                    $: { "xsi:type": "dcterms:W3CDTF" },
                },
            ];
            continue;
        }

        // normal string fields
        core[xmlKey] = [String(updates[key])];
    }

    const builder = new Builder();
    zip.file(corePath, builder.buildObject(parsed));
}
