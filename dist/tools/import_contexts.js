"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.importContextsSchema = void 0;
exports.importContexts = importContexts;
const fs = __importStar(require("fs"));
const client_1 = require("../db/client");
function importContexts(input) {
    const { file_path } = input;
    let raw;
    try {
        raw = fs.readFileSync(file_path, 'utf-8');
    }
    catch {
        return `Error: Could not read file at ${file_path}`;
    }
    let envelope;
    try {
        envelope = JSON.parse(raw);
    }
    catch {
        return `Error: File is not valid JSON.`;
    }
    const contexts = envelope?.contexts;
    if (!Array.isArray(contexts) || contexts.length === 0) {
        return 'No contexts found in the export file.';
    }
    let imported = 0;
    let skipped = 0;
    for (const record of contexts) {
        if ((0, client_1.findById)(record.id)) {
            skipped++;
        }
        else {
            (0, client_1.insertContext)(record);
            imported++;
        }
    }
    if (imported === 0) {
        return `⚠️ No new contexts imported. All ${skipped} record(s) already exist in the database.`;
    }
    const skipNote = skipped > 0 ? ` Skipped ${skipped} duplicate(s).` : '';
    return `✅ Imported ${imported} context(s) from ${file_path}.${skipNote}`;
}
exports.importContextsSchema = {
    name: 'import_contexts',
    description: 'Imports contexts from a previously exported JSON file into the local database. Skips records that already exist (safe to re-run).',
    inputSchema: {
        type: 'object',
        required: ['file_path'],
        properties: {
            file_path: {
                type: 'string',
                description: 'Absolute path to the exported JSON file (e.g. ~/.context-bridge/exports/export-2026-03-13-120000.json)',
            },
        },
    },
};
//# sourceMappingURL=import_contexts.js.map