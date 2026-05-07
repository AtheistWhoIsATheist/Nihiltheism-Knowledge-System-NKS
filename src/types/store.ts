export type NKSEntity = {
    id: string; // UUID
    type: string; // EntityType
    title: string;
    aliases: string[];
    createdAt: string; // ISO8601
    updatedAt: string; // ISO8601
    status: string; // EntityStatus
}

export type Relation = {
    id: string; // UUID
    type: string; // RelationType
    sourceId: string; // From Node ID
    targetId: string; // To Node ID
    directed: boolean;
    weight: number; // 0.0 - 1.0
    confidence: number; // 0.0 - 1.0
}
