import { CustomisedTinkeringActivity as PrismaCustomisedTinkeringActivity } from "@prisma/client";

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
  base_ta_id: number;
  student_id: number;
  status: string[];
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
  base_ta_id?: number;
  student_id?: number;
  status?: string[];
}
