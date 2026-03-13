interface ExportContextsInput {
    ids?: string[];
}
export declare function exportContexts(input: ExportContextsInput): string;
export declare const exportContextsSchema: {
    readonly name: "export_contexts";
    readonly description: "Exports saved contexts to a JSON file for backup or inspection. Exports all contexts by default, or a specific subset by UUID.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly ids: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "Optional list of context UUIDs to export. Omit to export all.";
            };
        };
    };
};
export {};
//# sourceMappingURL=export_contexts.d.ts.map