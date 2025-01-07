export type Subject = {
    id?: number;
    created_at?: string;
    subject: string;
}

export type Topic = {
    id?: number;
    created_at?: string;
    subject: Subject["id"];
    topic: string;
}

export type Subtopic = {
    id?: number;
    created_at?: string;
    topic: Topic["id"];
    sub_topic: string;
}