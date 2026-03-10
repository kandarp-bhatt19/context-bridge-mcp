import { Facts, Message } from '../db/client';
interface SaveContextInput {
    title: string;
    username: string;
    source_tool: string;
    facts: Facts;
    tags: string[];
    messages: Message[];
}
export declare function saveContext(input: SaveContextInput): {
    id: string;
};
export declare const saveContextSchema: {
    readonly name: "save_context";
    readonly description: "Persists the current session context to SQLite. Claude must extract facts and tags before calling this tool.";
    readonly inputSchema: {
        readonly type: "object";
        readonly properties: {
            readonly title: {
                readonly type: "string";
                readonly description: "Human-readable name for this context";
            };
            readonly username: {
                readonly type: "string";
                readonly description: "User identifier";
            };
            readonly source_tool: {
                readonly type: "string";
                readonly enum: readonly ["chat", "code", "cowork"];
                readonly description: "Which Claude tool is saving this context";
            };
            readonly facts: {
                readonly type: "object";
                readonly description: "Auto-extracted session summary";
                readonly properties: {
                    readonly current_task: {
                        readonly type: "string";
                    };
                    readonly key_decisions: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly open_questions: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly entities: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
                readonly required: readonly ["current_task", "key_decisions", "open_questions", "entities"];
            };
            readonly tags: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "3-5 short tags describing this session";
            };
            readonly messages: {
                readonly type: "array";
                readonly description: "Last 10 messages as role/content pairs";
                readonly items: {
                    readonly type: "object";
                    readonly properties: {
                        readonly role: {
                            readonly type: "string";
                            readonly enum: readonly ["user", "assistant"];
                        };
                        readonly content: {
                            readonly type: "string";
                        };
                    };
                    readonly required: readonly ["role", "content"];
                };
            };
        };
        readonly required: readonly ["title", "username", "source_tool", "facts", "tags", "messages"];
    };
};
export {};
//# sourceMappingURL=save_context.d.ts.map