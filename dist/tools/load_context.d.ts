interface LoadContextInput {
    id?: string;
    title?: string;
    tag?: string;
    latest?: boolean;
}
export declare function loadContext(input: LoadContextInput): string;
export declare const loadContextSchema: {
    readonly name: "load_context";
    readonly description: "Retrieves a saved context and announces it in the conversation. Provide one of: id, title, tag, or latest=true.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly id: {
                readonly type: "string";
                readonly description: "Exact UUID of the context to load";
            };
            readonly title: {
                readonly type: "string";
                readonly description: "Fuzzy title search (matches substrings)";
            };
            readonly tag: {
                readonly type: "string";
                readonly description: "Filter by a single tag";
            };
            readonly latest: {
                readonly type: "boolean";
                readonly description: "If true, loads the most recently saved context";
            };
        };
    };
};
export {};
//# sourceMappingURL=load_context.d.ts.map