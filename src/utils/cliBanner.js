import chalk from "chalk";
import fs from "fs";
import path from "path";

export function showBanner() {
    const pkgPath = path.resolve(process.cwd(), "package.json");

    let name = "Office Metadata Changer";
    let version = "0.0.0";
    let author = "cracked-c0de";

    try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        version = pkg.version ?? version;
        author = pkg.author ?? author;
    } catch {
        // ignore
    }

    console.log(
        chalk.blue.bold(`\n${name}`) +
        chalk.gray(` v${version}`)
    );

    if (author) {
        console.log(
            chalk.gray("by ") + chalk.green(author)
        );
    }

    console.log(chalk.gray("──────────────────────────────────"));
}
