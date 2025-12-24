import chalk from "chalk";
import fs from "fs";
import path from "path";

import { detectFormat } from "../core/detectFormat.js";
import { readMeta } from "../core/readMeta.js";
import { writeMeta } from "../core/writeMeta.js";
import { normalizeMeta } from "../core/normalize.js";
import { OfficeFileError } from "../core/errors.js";
import { convertDocToDocx } from "../formats/doc.js";

import {
    EXIT,
    BACK,
    askFilePath,
    askFields,
    askFieldValues,
    askSaveMode,
    askConvertDoc,
    askTimeOffset,
    showOverview,
} from "./prompts.js";

import { formatMetaValue } from "../utils/metaFormatter.js";
import { showBanner } from "../utils/cliBanner.js";

export async function runMenu() {
    try {
        // ================= BANNER =================
        showBanner();

        // ================= FILE =================
        let file = await askFilePath();
        if (file === EXIT) {
            console.log("👋 Exiting program");
            return;
        }

        let format = detectFormat(file);
        console.log(chalk.gray(`\nFormat: ${format.toUpperCase()}`));

        // ================= DOC → DOCX =================
        if (format === "doc") {
            console.log("⚠️ Legacy .doc format detected");

            const confirm = await askConvertDoc();
            if (!confirm) {
                console.log("❌ Operation cancelled");
                return;
            }

            file = convertDocToDocx(file);
            format = "docx";

            console.log("✔ File successfully converted:", file);
        }

        // ================= READ METADATA =================
        const rawMeta = await readMeta(file, format);
        const meta = normalizeMeta(rawMeta);

        console.log(chalk.cyan("\nCurrent metadata:\n"));

        for (const key in meta) {
            // special display for totalTime
            if (key === "totalTime") {
                const value =
                    typeof meta.totalTime === "number"
                        ? `${meta.totalTime} minutes`
                        : "—";

                console.log(
                    chalk.yellow("totalTime".padEnd(18)) +
                    chalk.white(value)
                );
                continue;
            }

            console.log(
                chalk.yellow(key.padEnd(18)) +
                chalk.white(formatMetaValue(key, meta[key]))
            );
        }

        // ================= SELECT FIELDS =================
        const fields = await askFields(meta);
        if (fields === EXIT) return;

        const needsDateInput =
            fields.includes("created") ||
            fields.includes("modified");

        // ================= TIME OFFSET =================
        let offset = 0;

        if (needsDateInput) {
            offset = await askTimeOffset();
            if (offset === EXIT) return;
            if (offset === BACK) return runMenu();
        }

        // ================= INPUT VALUES =================
        const updates = await askFieldValues(fields, meta, offset);
        if (updates === EXIT) return;
        if (updates === BACK) return runMenu();

        // ================= OVERVIEW =================
        const ok = await showOverview({
            file,
            format,
            meta,
            updates,
        });

        if (!ok) {
            console.log("↩ Cancelled. Returning to menu.\n");
            return runMenu();
        }

        // ================= SAVE MODE =================
        const saveMode = await askSaveMode();
        if (saveMode === EXIT) return;
        if (saveMode === BACK) return runMenu();

        // ================= OUTPUT PATH =================
        let outputPath;

        if (saveMode === "overwrite") {
            outputPath = file;
        } else {
            const outputDir = path.resolve(
                process.cwd(),
                "office-meta-output"
            );
            fs.mkdirSync(outputDir, { recursive: true });

            const ext = path.extname(file);
            const base = path.basename(file, ext);
            outputPath = path.join(outputDir, `${base}.meta${ext}`);
        }

        console.log(chalk.gray("Saving to:"), outputPath);

        // ================= WRITE =================
        await writeMeta(file, format, updates, outputPath);

        console.log(
            chalk.green(
                saveMode === "overwrite"
                    ? "\n✔ Original file updated"
                    : `\n✔ New file created: ${outputPath}`
            )
        );
    } catch (err) {
        console.log();

        if (err instanceof OfficeFileError) {
            console.error("❌", err.message);
            if (err.hint) {
                console.error("💡 Hint:", err.hint);
            }
        } else {
            console.error("❌ Unexpected error:", err.message);
        }

        process.exit(1);
    }
}