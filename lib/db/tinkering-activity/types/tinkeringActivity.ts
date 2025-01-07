
export type TinkeringActivity = {
    id?: number;
    serial?: number;
    created_at?: string;
    name: string;
    sub_topic: number;
    introduction: string;
    goals?: string[];
    materials?: string[];
    instructions?: string[];
    tips?: string[];
    observations?: string[];
    extensions?: string[];
    resources?: string[];
    type: "default" | "custom";
    subject?: string;
    topic?: string;
    subTopic?: string;
}

export type CustomisedTinkeringActivity = {
    id?: number;
    created_at?: string;
    base_ta: number;
    ta: number;
    user_id: string;
    payment: number;
}