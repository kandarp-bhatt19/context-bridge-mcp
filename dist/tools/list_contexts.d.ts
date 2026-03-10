interface ListContextsInput {
    tag?: string;
    source_tool?: string;
    limit?: number;
}
export declare function listContextsTool(input: ListContextsInput): string;
export declare const listContextsSchema: {
    readonly name: "list_contexts";
    readonly description: "Returns a browsable list of saved contexts, sorted by most recent first.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly tag: {
                readonly type: "string";
                readonly description: "Filter results by tag";
            };
            readonly source_tool: {
                readonly type: "string";
                readonly enum: readonly ["chat", "code", "cowork"];
                readonly description: "Filter results by source tool";
            };
            readonly limit: {
                readonly type: "number";
                readonly description: "Maximum number of results to return (default: 20)";
            };
        };
    };
};
export {};
//# sourceMappingURL=list_contexts.d.ts.map