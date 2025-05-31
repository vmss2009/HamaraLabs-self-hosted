import {
  Subject as PrismaSubject,
  Topic as PrismaTopic,
  Subtopic as PrismaSubtopic,
  TinkeringActivity as PrismaTinkeringActivity,
} from "@prisma/client";

export interface SubjectCreateInput {
  subject_name: string;
}

export interface SubjectWithTopics extends PrismaSubject {
  topics: PrismaTopic[];
}

export interface TopicCreateInput {
  topic_name: string;
  subjectId: number;
}

export interface TopicWithSubject extends PrismaTopic {
  subject: PrismaSubject;
}

export interface SubtopicCreateInput {
  subtopic_name: string;
  topicId: number;
}

export interface SubtopicWithTopic extends PrismaSubtopic {
  topic: TopicWithSubject;
}

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

export interface TinkeringActivityWithSubtopic extends PrismaTinkeringActivity {
  subtopic: SubtopicWithTopic;
}

import { z } from "zod";

export const tinkeringActivitySchema = z.object({
  name: z.string().min(1, "Activity name is required"),
  subtopicId: z
    .number()
    .int()
    .positive("Subtopic ID must be a positive number"),
  introduction: z.string().min(1, "Introduction is required"),
  goals: z.array(z.string()).optional().default([]),
  materials: z.array(z.string()).optional().default([]),
  instructions: z.array(z.string()).optional().default([]),
  tips: z.array(z.string()).optional().default([]),
  observations: z.array(z.string()).optional().default([]),
  extensions: z.array(z.string()).optional().default([]),
  resources: z.array(z.string()).optional().default([]),
});
