import path from "path";

export function detectFormat(filePath) {
    return path.extname(filePath).slice(1).toLowerCase();
}
