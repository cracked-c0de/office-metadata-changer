import { execSync } from "child_process";
import path from "path";
import fs from "fs";

function hasSoffice() {
    try {
        execSync("soffice --version", { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

export function convertDocToDocx(inputPath) {
    if (!hasSoffice()) {
        throw new Error(
            "LibreOffice (soffice) is not available.\n" +
            "Install LibreOffice and make sure `soffice` is in your PATH."
        );
    }

    const outDir = path.dirname(inputPath);
    const base = path.basename(inputPath, ".doc");
    const outputPath = path.join(outDir, `${base}.docx`);

    try {
        execSync(
            `soffice --headless --convert-to docx "${inputPath}" --outdir "${outDir}"`,
            { stdio: "ignore" }
        );
    } catch (err) {
        throw new Error(
            "Failed to convert .doc → .docx using LibreOffice.\n" +
            "Try running the command manually:\n" +
            `soffice --headless --convert-to docx "${inputPath}"`
        );
    }

    if (!fs.existsSync(outputPath)) {
        throw new Error("Conversion finished but output .docx file was not found.");
    }

    return outputPath;
}
