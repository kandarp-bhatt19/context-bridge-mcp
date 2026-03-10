export interface RemoveContextArgs {
    id?: string;
    all?: boolean;
    confirm?: boolean;
}
export declare const removeContextSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            id: {
                type: string;
                description: string;
            };
            all: {
                type: string;
                description: string;
            };
            confirm: {
                type: string;
                description: string;
            };
        };
    };
};
export declare function removeContext(args: RemoveContextArgs): string;
//# sourceMappingURL=remove_context.d.ts.map