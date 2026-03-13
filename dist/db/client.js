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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertContext = insertContext;
exports.findById = findById;
exports.findByTitle = findByTitle;
exports.findByTag = findByTag;
exports.findLatest = findLatest;
exports.deleteById = deleteById;
exports.deleteAll = deleteAll;
exports.findByIds = findByIds;
exports.listAllContexts = listAllContexts;
exports.listContexts = listContexts;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs = __importStar(require("fs"));
const config_1 = require("../config");
const schema_1 = require("./schema");
function deserialize(row) {
    return {
        ...row,
        tags: JSON.parse(row.tags),
        facts: JSON.parse(row.facts),
        last_messages: JSON.parse(row.last_messages),
    };
}
function openDb() {
    fs.mkdirSync(config_1.config.dbDir, { recursive: true });
    const db = new better_sqlite3_1.default(config_1.config.dbPath);
    (0, schema_1.runMigrations)(db);
    return db;
}
const db = openDb();
function insertContext(record) {
    const stmt = db.prepare(`
    INSERT INTO contexts (id, title, username, source_tool, tags, facts, last_messages, created_at, updated_at)
    VALUES (@id, @title, @username, @source_tool, @tags, @facts, @last_messages, @created_at, @updated_at)
  `);
    stmt.run({
        ...record,
        tags: JSON.stringify(record.tags),
        facts: JSON.stringify(record.facts),
        last_messages: JSON.stringify(record.last_messages),
    });
}
function findById(id) {
    const row = db.prepare('SELECT * FROM contexts WHERE id = ?').get(id);
    return row ? deserialize(row) : null;
}
function findByTitle(title) {
    const row = db.prepare('SELECT * FROM contexts WHERE title LIKE ? ORDER BY created_at DESC LIMIT 1').get(`%${title}%`);
    return row ? deserialize(row) : null;
}
function findByTag(tag) {
    const row = db.prepare('SELECT * FROM contexts WHERE tags LIKE ? ORDER BY created_at DESC LIMIT 1').get(`%"${tag}"%`);
    return row ? deserialize(row) : null;
}
function findLatest() {
    const row = db.prepare('SELECT * FROM contexts ORDER BY created_at DESC LIMIT 1').get();
    return row ? deserialize(row) : null;
}
function deleteById(id) {
    const row = db.prepare('SELECT title FROM contexts WHERE id = ?').get(id);
    if (!row)
        return { deleted: false };
    db.prepare('DELETE FROM contexts WHERE id = ?').run(id);
    return { deleted: true, title: row.title };
}
function deleteAll() {
    const result = db.prepare('DELETE FROM contexts').run();
    return { count: result.changes };
}
function findByIds(ids) {
    if (ids.length === 0)
        return [];
    const placeholders = ids.map(() => '?').join(', ');
    const rows = db.prepare(`SELECT * FROM contexts WHERE id IN (${placeholders}) ORDER BY created_at DESC`).all(ids);
    return rows.map(deserialize);
}
function listAllContexts() {
    const rows = db.prepare('SELECT * FROM contexts ORDER BY created_at DESC').all();
    return rows.map(deserialize);
}
function listContexts(opts) {
    const { tag, source_tool, limit = 20 } = opts;
    const conditions = [];
    const params = [];
    if (tag) {
        conditions.push(`tags LIKE ?`);
        params.push(`%"${tag}"%`);
    }
    if (source_tool) {
        conditions.push(`source_tool = ?`);
        params.push(source_tool);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = db.prepare(`SELECT * FROM contexts ${where} ORDER BY created_at DESC LIMIT ?`).all([...params, limit]);
    return rows.map(deserialize);
}
//# sourceMappingURL=client.js.map