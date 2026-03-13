interface ImportContextsInput {
    file_path: string;
}
export declare function importContexts(input: ImportContextsInput): string;
export declare const importContextsSchema: {
    readonly name: "import_contexts";
    readonly description: "Imports contexts from a previously exported JSON file into the local database. Skips records that already exist (safe to re-run).";
    readonly inputSchema: {
        readonly type: "object";
        readonly required: readonly ["file_path"];
        readonly properties: {
            readonly file_path: {
                readonly type: "string";
                readonly description: "Absolute path to the exported JSON file (e.g. ~/.context-bridge/exports/export-2026-03-13-120000.json)";
            };
        };
    };
};
export {};
//# sourceMappingURL=import_contexts.d.ts.map