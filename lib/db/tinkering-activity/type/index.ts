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

export type Subject = {
  id: number;
  subject_name: string;
};

export type Topic = {
  id: number;
  topic_name: string;
};

export type Subtopic = {
  id: number;
  subtopic_name: string;
};

export interface EditActivityDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  editFormData: any;
  handleEditFormChange: (field: string, value: string) => void;
  handleArrayFieldChange: (field: string, index: number, value: string) => void;
  handleAddArrayItem: (field: string) => void;
  handleRemoveArrayItem: (field: string, index: number) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedTopic: string;
  setSelectedTopic: (value: string) => void;
  selectedSubtopic: string;
  setSelectedSubtopic: (value: string) => void;
  subjects: any[];
  topics: any[];
  subtopics: any[];
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

export interface TinkeringActivity {
  id: string;
  name: string;
  introduction?: string;
  instructions?: string[];
  goals?: string[];
  materials?: string[];
  tips?: string[];
  observations?: string[];
  resources?: string[];
  extensions?: string[];
  subject_name?: string | null;
  topic_name?: string | null;
  subtopic_name?: string | null;
  subtopic?: any;
  created_at?: string;
}

export interface TinkeringActivityWithSubtopic extends PrismaTinkeringActivity {
  subtopic: SubtopicWithTopic;
}
