import { execSync } from "child_process";
import path from "path";
import fs from "fs";

export function convertDocToDocx(inputPath) {
    const outDir = path.dirname(inputPath);
    const base = path.basename(inputPath, ".doc");
    const outputPath = path.join(outDir, `${base}.docx`);

    try {
        execSync(
            `soffice --headless --convert-to docx "${inputPath}" --outdir "${outDir}"`,
            { stdio: "ignore" }
        );
    } catch {
        throw new Error(
            "Could not convert .doc → .docx. Make sure LibreOffice is installed."
        );
    }

    if (!fs.existsSync(outputPath)) {
        throw new Error("Conversion failed: output file not found.");
    }

    return outputPath;
}
