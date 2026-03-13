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
exports.exportContextsSchema = void 0;
exports.exportContexts = exportContexts;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const client_1 = require("../db/client");
const config_1 = require("../config");
function exportContexts(input) {
    const { ids } = input;
    let records;
    let missingIds = [];
    if (ids && ids.length > 0) {
        records = (0, client_1.findByIds)(ids);
        const foundIds = new Set(records.map(r => r.id));
        missingIds = ids.filter(id => !foundIds.has(id));
    }
    else {
        records = (0, client_1.listAllContexts)();
    }
    if (records.length === 0) {
        return 'No contexts found to export.';
    }
    fs.mkdirSync(config_1.config.exportDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `export-${timestamp}.json`;
    const filePath = path.join(config_1.config.exportDir, fileName);
    const envelope = {
        exported_at: new Date().toISOString(),
        count: records.length,
        contexts: records,
    };
    fs.writeFileSync(filePath, JSON.stringify(envelope, null, 2));
    if (missingIds.length > 0) {
        return `⚠️ Exported ${records.length} context(s). Could not find IDs: ${missingIds.join(', ')}. File written to ${filePath}`;
    }
    return `✅ Exported ${records.length} context(s) to ${filePath}`;
}
exports.exportContextsSchema = {
    name: 'export_contexts',
    description: 'Exports saved contexts to a JSON file for backup or inspection. Exports all contexts by default, or a specific subset by UUID.',
    inputSchema: {
        type: 'object',
        properties: {
            ids: {
                type: 'array',
                items: { type: 'string' },
                description: 'Optional list of context UUIDs to export. Omit to export all.',
            },
        },
    },
};
//# sourceMappingURL=export_contexts.js.map