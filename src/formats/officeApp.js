import { parseStringPromise, Builder } from "xml2js";
import { OfficeFileError } from "../core/errors.js";

/**
 * Shared XML parser options
 * (IMPORTANT: must be identical for read & write)
 */
const XML_OPTIONS = {
    explicitArray: true,
    preserveChildrenOrder: true,
};

/* ================= READ ================= */

export async function readAppMeta(zip) {
    const file = zip.file("docProps/app.xml");
    if (!file) return {};

    const parsed = await parseStringPromise(
        await file.async("text"),
        XML_OPTIONS
    );

    const props = parsed.Properties;
    if (!props) return {};

    return {
        totalTime: props.TotalTime
            ? Number(props.TotalTime[0])
            : undefined,
    };
}

/* ================= WRITE ================= */

export async function writeAppMeta(zip, updates = {}) {
    const appPath = "docProps/app.xml";
    const file = zip.file(appPath);
    if (!file) {
        throw new OfficeFileError("app.xml is missing");
    }

    const parsed = await parseStringPromise(
        await file.async("text"),
        XML_OPTIONS
    );

    const props = parsed.Properties;
    if (!props) {
        throw new OfficeFileError("Invalid app.xml structure");
    }

    const minutes = parseInt(updates.totalTime, 10);
    if (Number.isNaN(minutes) || minutes < 0) return;

    // ✅ STRICT OOXML: string, no namespace, no objects
    props.TotalTime = [String(minutes)];

    const builder = new Builder({
        xmldec: {
            version: "1.0",
            encoding: "UTF-8",
            standalone: "yes",
        },
        // ❌ NO pretty printing for app.xml
    });

    zip.file(appPath, builder.buildObject(parsed));
}
