export interface Facts {
    current_task: string;
    key_decisions: string[];
    open_questions: string[];
    entities: string[];
}
export interface Message {
    role: 'user' | 'assistant';
    content: string;
}
export interface ContextRecord {
    id: string;
    title: string;
    username: string;
    source_tool: string;
    tags: string[];
    facts: Facts;
    last_messages: Message[];
    created_at: string;
    updated_at: string;
}
export declare function insertContext(record: ContextRecord): void;
export declare function findById(id: string): ContextRecord | null;
export declare function findByTitle(title: string): ContextRecord | null;
export declare function findByTag(tag: string): ContextRecord | null;
export declare function findLatest(): ContextRecord | null;
export declare function deleteById(id: string): {
    deleted: boolean;
    title?: string;
};
export declare function deleteAll(): {
    count: number;
};
export declare function listContexts(opts: {
    tag?: string;
    source_tool?: string;
    limit?: number;
}): ContextRecord[];
//# sourceMappingURL=client.d.ts.map