import { CustomisedTinkeringActivity as PrismaCustomisedTinkeringActivity } from "@prisma/client";
import { z } from "zod";

export interface CustomisedTinkeringActivityCreateInput {
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
  base_ta_id: string;
  student_id: string;
  status: string[];
  comments: string;
}

export interface CustomisedTinkeringActivityWithRelations
  extends PrismaCustomisedTinkeringActivity {
  subtopic: {
    id: number;
    subtopic_name: string;
    topic: {
      id: number;
      topic_name: string;
      subject: {
        id: number;
        subject_name: string;
      };
    };
  };
}

export interface CustomisedTinkeringActivityFilter {
  name?: string;
  subtopic_id?: number;
  base_ta_id?: string;
  student_id?: string;
  status?: string[];
}

export const statusSchema = z.object({
    status: z.array(z.string()),
  });

export const customisedTinkeringActivitySchema = z.object({
  name: z.string().min(1, "Activity name is required"),
  subtopic_id: z
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
  status: z.array(z.string()).optional().default([]),
  comments: z.string().optional().default(""),
});

export interface TinkeringActivityGenerationInput {
  previousActivities: any[];
  prompt: string;
}

export interface GeneratedTinkeringActivity {
  introduction: string;
}

export interface GeneratedTAData {
  id: string;
  name: string;
  introduction: string;
  goals: string[];
  instructions: string[];
  tips: string[];
  resources: string[];
  materials: string[];
  assessment: string[];
  extensions: string[];
}

export interface DetailedTAGenerationInput {
  activityIntroduction: string;
  aspiration: string;
  comments: string;
  resources: string;
}

export interface DetailedGeneratedTA {
  name: string;
  introduction: string;
  goals: string[];
  materials: string[];
  instructions: string[];
  tips: string[];
  observations: string[];
  extensions: string[];
  resources: string[];
}