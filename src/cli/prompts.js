import inquirer from "inquirer";
import fs from "fs";
import chalk from "chalk";

import { formatMetaValue } from "../utils/metaFormatter.js";

/* ===================== constants ===================== */

export const EXIT = "__EXIT__";
export const BACK = "__BACK__";

/* ===================== helpers ===================== */

function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function normalize(v) {
    return String(v ?? "").trim().toLowerCase();
}

function isExit(v) {
    return ["exit", "quit", "q"].includes(v);
}

function isBack(v) {
    return ["back", "b"].includes(v);
}

async function askNumber({ message, min, max, defaultValue }) {
    const { value } = await inquirer.prompt([
        {
            type: "input",
            name: "value",
            message,
            default: (defaultValue >= min && defaultValue <= max)
                ? defaultValue
                : min,
            filter: (v) => String(v).trim(),
            validate: (v) => {
                if (v === "") return "Field cannot be empty";
                if (isExit(v) || isBack(v)) return true;

                const n = Number(v);
                if (Number.isInteger(n) && n >= min && n <= max) return true;

                return `Enter a number between ${min} and ${max}`;
            }
        },
    ]);

    const v = normalize(value);
    if (isExit(v)) return EXIT;
    if (isBack(v)) return BACK;

    return Number(v);
}

function toISOPreview(value) {
    if (!value) return "";

    // уже ISO-строка
    if (typeof value === "string") {
        const d = new Date(value);
        if (isNaN(d)) return "";
        return d.toISOString();
    }

    // объект с offset
    if (typeof value === "object") {
        const {
            year,
            month,
            day,
            hour = 0,
            minute = 0,
            second = 0,
            offset = 0,
        } = value;

        const utcHour = hour - offset;

        const d = new Date(Date.UTC(
            year,
            month - 1,
            day,
            utcHour,
            minute,
            second
        ));

        return d.toISOString();
    }

    return "";
}

export async function askDateParts(label, offset) {
    console.log(
        `\n📅 Entering date for field: ${label}\n` +
        `⏱ Offset: UTC${offset >= 0 ? "+" : ""}${offset}`
    );

    const now = new Date();

    const year = await askNumber({
        message: "Year (YYYY):",
        min: 1970,
        max: 2100,
        defaultValue: String(now.getUTCFullYear()),
    });
    if (year === EXIT || year === BACK) return year;

    const month = await askNumber({
        message: "Month (1-12):",
        min: 1,
        max: 12,
        defaultValue: String(now.getUTCMonth() + 1),
    });
    if (month === EXIT || month === BACK) return month;

    const day = await askNumber({
        message: `Day (1-${daysInMonth(year, month)}):`,
        min: 1,
        max: daysInMonth(year, month),
        defaultValue: String(now.getUTCDate()),
    });
    if (day === EXIT || day === BACK) return day;

    const hour = await askNumber({
        message: "Hour (0-23):",
        min: 0,
        max: 23,
        defaultValue: 0,
    });
    if (hour === EXIT || hour === BACK) return hour;

    const minute = await askNumber({
        message: "Minute (0-59):",
        min: 0,
        max: 59,
        defaultValue: 0,
    });
    if (minute === EXIT || minute === BACK) return minute;

    const second = await askNumber({
        message: "Second (0-59):",
        min: 0,
        max: 59,
        defaultValue: 0,
    });
    if (second === EXIT || second === BACK) return second;

    return {
        year,
        month,
        day,
        hour,
        minute,
        second,
        offset
    };
}


/* ===================== meta fields ===================== */

const META_FIELDS = [
    { key: "title", label: "Title — document title" },
    { key: "subject", label: "Subject — document subject" },
    { key: "creator", label: "Author — author" },
    { key: "description", label: "Description — description" },
    { key: "keywords", label: "Keywords — keywords" },
    { key: "category", label: "Category — category" },
    { key: "lastModifiedBy", label: "Last Modified By — last modified by" },
    { key: "created", label: "Created Date — created date" },
    { key: "modified", label: "Modified Date — modified date" },
    { key: "totalTime", label: "Total Editing Time — total time spent editing (minutes)" }

];

/* ===================== prompts ===================== */

export async function askFilePath() {
    const { file } = await inquirer.prompt([
        {
            type: "input",
            name: "file",
            message: "File path (or exit to quit):",
            validate: (input) => {
                const v = normalize(input);
                if (isExit(v)) return true;
                return fs.existsSync(input) || "File not found";
            },
        },
    ]);

    const v = normalize(file);
    if (isExit(v)) return EXIT;

    return file;
}

export async function askFields(meta) {
    const choices = META_FIELDS.map((f) => ({
        name: f.label,
        value: f.key,
        checked: meta[f.key] !== undefined && meta[f.key] !== "",
    }));

    const { fields } = await inquirer.prompt([
        {
            type: "checkbox",
            name: "fields",
            message: "Which metadata fields to change or add? (back / exit)",
            choices,
            pageSize: choices.length,
            loop: false,
            validate: (a) => {
                if (a.includes("exit")) return true;
                return a.length > 0 || "Select at least one field";
            },
        },
    ]);

    if (fields.includes("exit")) return EXIT;
    return fields;
}

export async function askFieldValues(fields, meta, offset) {
    const updates = {};

    for (const field of fields) {
        // 🔹 ДАТЫ
        if (field === "created" || field === "modified") {
            const dateValue = await askDateParts(field, offset);

            if (dateValue === EXIT) return EXIT;
            if (dateValue === BACK) return BACK;

            updates[field] = dateValue;
            continue;
        }

        if (field === "totalTime") {
            const { value } = await inquirer.prompt([
                {
                    type: "input",
                    name: "value",
                    message: "Total editing time (minutes):",
                    default: String(meta.totalTime ?? 0),
                    filter: (v) => v.trim(),
                    validate: (v) => {
                        if (isExit(v) || isBack(v)) return true;

                        const n = Number(v);
                        return Number.isInteger(n) && n >= 0
                            ? true
                            : "Enter a non-negative integer (minutes)";
                    },
                },
            ]);

            if (isExit(value)) return EXIT;
            if (isBack(value)) return BACK;

            updates.totalTime = Number(value);
            continue;
        }


        // 🔹 ОБЫЧНЫЕ ПОЛЯ
        const { value } = await inquirer.prompt([
            {
                type: "input",
                name: "value",
                message: `New value for ${field} (back / exit):`,
                default: meta[field] ?? "",
                validate: (v) => {
                    if (isExit(v) || isBack(v)) return true;
                    return true;
                },
            },
        ]);

        const v = normalize(value);

        if (isExit(v)) return EXIT;
        if (isBack(v)) return BACK;

        updates[field] = value;
    }

    return updates;
}


export async function askSaveMode() {
    const { saveMode } = await inquirer.prompt([
        {
            type: "input",
            name: "saveMode",
            message:
                "How to save the file?\n" +
                "  new        — create a new file (default)\n" +
                "  overwrite  — overwrite the original\n" +
                "  back       — go back\n" +
                "  exit       — exit\n" +
                ">",
            default: "new",
            filter: normalize,
            validate: (v) => {
                if (["", "new", "n"].includes(v)) return true;
                if (["overwrite", "o"].includes(v)) return true;
                if (["back", "b"].includes(v)) return true;
                if (isExit(v)) return true;
                return "Enter: new, overwrite, back, or exit";
            },
        },
    ]);

    const v = normalize(saveMode);

    if (isExit(v)) return EXIT;
    if (v === "back" || v === "b") return BACK;
    if (v === "" || v === "new" || v === "n") return "new";

    return "overwrite";
}

export async function askConvertDoc() {
    const { confirm } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Detected outdated .doc format. Convert to .docx?",
            default: true,
        },
    ]);

    return confirm;
}

export async function askTimeOffset() {
    const { offset } = await inquirer.prompt([
        {
            type: "input",
            name: "offset",
            message:
                "⏱ Specify the offset from UTC\n" +
                "Examples:\n" +
                "  0    → UTC\n" +
                "  +5   → UTC+5\n" +
                "  -3   → UTC-3\n" +
                "  back — go back\n" +
                "  exit — exit\n" +
                ">",
            default: "0",
            filter: normalize,
            validate: (v) => {
                if (isExit(v) || isBack(v)) return true;

                if (/^[+-]?\d{1,2}$/.test(v)) {
                    const n = Number(v);
                    if (n >= -12 && n <= 14) return true;
                }

                return "Enter a number from -12 to +14 (e.g. +5)";
            },
        },
    ]);

    const v = normalize(offset);

    if (isExit(v)) return EXIT;
    if (isBack(v)) return BACK;

    return Number(v);
}

export async function showOverview({ file, format, meta, updates }) {
    console.log(chalk.cyan("\n──────────── OVERVIEW ────────────"));
    console.log(`File: ${file}`);
    console.log(`Format: ${format.toUpperCase()}\n`);

    console.log("Changes:");

    for (const key in updates) {
        const oldVal = meta[key];
        const newVal = updates[key];

        console.log(chalk.yellow(`\n• ${key}`));

        if (oldVal !== undefined) {
            console.log(
                chalk.gray("  old: "),
                chalk.white(formatMetaValue(key, oldVal))
            );
        }

        console.log(
            chalk.gray("  new: "),
            chalk.white(formatMetaValue(key, newVal))
        );

        if (key === "created" || key === "modified") {
            console.log(
                chalk.gray("  will be: "),
                chalk.white(toISOPreview(newVal))
            );
        }
    }

    console.log(chalk.cyan("──────────────────────────────────"));

    const { confirm } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: "Continue saving?",
            default: true,
        },
    ]);

    return confirm;
}