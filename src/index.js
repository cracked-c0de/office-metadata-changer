#!/usr/bin/env node

import { runMenu } from "./cli/menu.js";

runMenu().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
});
