import { Subject as PrismaSubject, Topic as PrismaTopic, Subtopic as PrismaSubtopic, TinkeringActivity as PrismaTinkeringActivity } from "@prisma/client";

// Subject types
export interface SubjectCreateInput {
  subject_name: string;
}

export interface SubjectWithTopics extends PrismaSubject {
  topics: PrismaTopic[];
}

// Topic types
export interface TopicCreateInput {
  topic_name: string;
  subjectId: number;
}

export interface TopicWithSubject extends PrismaTopic {
  subject: PrismaSubject;
}

// Subtopic types
export interface SubtopicCreateInput {
  subtopic_name: string;
  topicId: number;
}

export interface SubtopicWithTopic extends PrismaSubtopic {
  topic: TopicWithSubject;
}

// TinkeringActivity types
export interface TinkeringActivityCreateInput {
  name: string;
  subtopicId: number;
  introduction: string;
  goals: string[];
  materials: string[];
  instructions: string[];
  tips: string[];
  observations: string[];
  extensions: string[];
  resources: string[];
  type: "customised" | "default";
}

export interface TinkeringActivityWithSubtopic {
  id: string;
  created_at: Date;
  name: string;
  subtopic_id: number;
  introduction: string;
  goals: string[];
  materials: string[];
  instructions: string[];
  tips: string[];
  observations: string[];
  extensions: string[];
  resources: string[];
  subtopic: SubtopicWithTopic;
  CustomisedTinkeringActivity?: {
    id: string;
    student_id: string;
    status: string[];
  }[];
} 