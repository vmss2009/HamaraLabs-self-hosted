import { prisma } from "@/lib/db/prisma";
import { pruneTAAttachments } from "@/lib/db/snapshot-attachments/crud";
import {
  CustomisedTinkeringActivityCreateInput,
  CustomisedTinkeringActivityFilter,
  CustomisedTinkeringActivityWithRelations,
  TinkeringActivityGenerationInput,
  GeneratedTinkeringActivity,
  GeneratedTAData,
  DetailedTAGenerationInput,
  DetailedGeneratedTA,
} from "../type";
import { GoogleGenAI, Type } from "@google/genai";
import type { Prisma } from "@prisma/client";
import { notifyStudentAssignment, notifyStudentStatusUpdate } from "@/lib/notifications/service";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

function haveStatusesChanged(previous: string[] | null | undefined, next: string[] | null | undefined) {
  if (!next) return false;
  const prev = previous ?? [];
  if (prev.length !== next.length) return true;
  const prevSet = new Set(prev);
  const nextSet = new Set(next);
  if (prevSet.size !== nextSet.size) return true;
  for (const status of nextSet) {
    if (!prevSet.has(status)) return true;
  }
  return false;
}

export async function createCustomisedTinkeringActivity(
  data: CustomisedTinkeringActivityCreateInput,
  createdByUserId?: string | null
): Promise<CustomisedTinkeringActivityWithRelations> {
  const created = await prisma.customisedTinkeringActivity.create({
    data: ({
      name: data.name,
      subtopic_id: data.subtopic_id,
      introduction: data.introduction,
      goals: data.goals,
      materials: data.materials,
      instructions: data.instructions,
      tips: data.tips,
      observations: data.observations,
      extensions: data.extensions,
      resources: data.resources,
      comments: data.comments,
      attachments: data.attachments,
      base_ta_id: data.base_ta_id,
      student_id: data.student_id,
      status: data.status,
    } as any),
    include: {
      subtopic: {
        select: {
          id: true,
          subtopic_name: true,
          topic: {
            select: {
              id: true,
              topic_name: true,
              subject: {
                select: {
                  id: true,
                  subject_name: true,
                },
              },
            },
          },
        },
      },
      snapshot_attachments: true,
    },
  });

  await notifyStudentAssignment({
    studentId: created.student_id,
    entityType: "tinkering-activity",
    entityName: created.name,
    resourceId: created.id,
    createdByUserId,
  });

  return created;
}

export async function getCustomisedTinkeringActivities(
  filter?: CustomisedTinkeringActivityFilter
): Promise<CustomisedTinkeringActivityWithRelations[]> {
  const where: Prisma.CustomisedTinkeringActivityWhereInput = {};

  if (filter?.name) {
    where.name = { contains: filter.name, mode: "insensitive" };
  }

  if (filter?.subtopic_id) {
    where.subtopic_id = filter.subtopic_id;
  }

  if (filter?.base_ta_id) {
    where.base_ta_id = filter.base_ta_id;
  }

  if (filter?.student_id) {
    where.student_id = filter.student_id;
  }

  if (filter?.status) {
    where.status = { hasSome: filter.status };
  }

  return prisma.customisedTinkeringActivity.findMany({
    where,
    include: {
      subtopic: {
        select: {
          id: true,
          subtopic_name: true,
          topic: {
            select: {
              id: true,
              topic_name: true,
              subject: {
                select: {
                  id: true,
                  subject_name: true,
                },
              },
            },
          },
        },
      },
      snapshot_attachments: true,
    },
  });
}

export async function getCustomisedTinkeringActivityById(
  id: string
): Promise<CustomisedTinkeringActivityWithRelations | null> {
  return prisma.customisedTinkeringActivity.findUnique({
    where: { id },
    include: {
      subtopic: {
        select: {
          id: true,
          subtopic_name: true,
          topic: {
            select: {
              id: true,
              topic_name: true,
              subject: {
                select: {
                  id: true,
                  subject_name: true,
                },
              },
            },
          },
        },
      },
      snapshot_attachments: true,
    },
  });
}

export async function updateCustomisedTinkeringActivity(
  id: string,
  data: Partial<CustomisedTinkeringActivityCreateInput> & { keepSnapshotAttachmentUrls?: string[] },
  updatedByUserId?: string | null
): Promise<CustomisedTinkeringActivityWithRelations> {
  const keepUrls = data.keepSnapshotAttachmentUrls || [];
  const existing = await prisma.customisedTinkeringActivity.findUnique({
    where: { id },
    select: { status: true },
  });
  const updated = await prisma.customisedTinkeringActivity.update({
    where: { id },
    data: ({
      name: data.name,
      subtopic_id: data.subtopic_id,
      introduction: data.introduction,
      goals: data.goals,
      materials: data.materials,
      instructions: data.instructions,
      tips: data.tips,
      observations: data.observations,
      extensions: data.extensions,
      resources: data.resources,
      comments: data.comments,
      attachments: data.attachments,
      base_ta_id: data.base_ta_id,
      student_id: data.student_id,
      status: data.status,
    } as any),
    include: {
      subtopic: {
        select: {
          id: true,
          subtopic_name: true,
          topic: {
            select: {
              id: true,
              topic_name: true,
              subject: {
                select: {
                  id: true,
                  subject_name: true,
                },
              },
            },
          },
        },
      },
      snapshot_attachments: true,
    },
  });
  // Prune snapshot attachments (not stored in attachments[] array) if caller provided urls to keep
  if (Object.prototype.hasOwnProperty.call(data, 'keepSnapshotAttachmentUrls')) {
    await pruneTAAttachments(id, keepUrls);
  }
  if (haveStatusesChanged(existing?.status, Array.isArray(data.status) ? data.status : undefined)) {
      const previousStatuses = Array.isArray(existing?.status) ? existing?.status ?? [] : [];
      const nextStatuses = Array.isArray(updated.status) ? updated.status ?? [] : [];
      const previousStatus = previousStatuses.length ? previousStatuses[previousStatuses.length - 1] : null;
      const currentStatus = nextStatuses.length ? nextStatuses[nextStatuses.length - 1] : null;
    await notifyStudentStatusUpdate({
      studentId: updated.student_id,
      entityType: "tinkering-activity",
      entityName: updated.name,
        previousStatus,
        currentStatus,
      resourceId: updated.id,
      excludeUserId: updatedByUserId,
    });
  }
  return updated;
}

export async function deleteCustomisedTinkeringActivity(
  id: string
): Promise<CustomisedTinkeringActivityWithRelations> {
  return prisma.customisedTinkeringActivity.delete({
    where: { id },
    include: {
      subtopic: {
        select: {
          id: true,
          subtopic_name: true,
          topic: {
            select: {
              id: true,
              topic_name: true,
              subject: {
                select: {
                  id: true,
                  subject_name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function generateCustomisedTinkeringActivities(
  input: TinkeringActivityGenerationInput
): Promise<GeneratedTinkeringActivity[]> {
  const { previousActivities, prompt } = input;

  const updatedData = previousActivities.map((obj: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(obj).filter(([key]) => 
        ["name", "introduction", "status"].includes(key)
      )
    )
  );

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                Past tinkering activities: ${JSON.stringify(updatedData, null, 2)}

                ${prompt}
                You need to generate exactly 10 different TAs so that the user can choose from them. Follow the above instructions and ensure that each TA has unique introduction.
                It must be short, succinct, clear, concise, and easy to understand.
                It must be creative, fun, engaging, intuitive, and hands-on.
              `
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              introduction: { type: Type.STRING },
            },
            required: ["introduction"],
            propertyOrdering: ["introduction"]
          }
        }
      }
    });

    const data: GeneratedTinkeringActivity[] = JSON.parse(response.text!);

    const generatedTADataPromises = data.map(async (activity, index) => {
      const id = `TA${Date.now() + index}`;
      
      const generatedTAData: GeneratedTAData = {
        id: id,
        name: "",
        introduction: activity.introduction,
        goals: [],
        instructions: [],
        tips: [],
        resources: [],
        materials: [],
        assessment: [],
        extensions: [],
      };

      return generatedTAData;
    });

    await Promise.all(generatedTADataPromises);
    return data;

  } catch (error) {
    console.error("Error generating tinkering activities:", error);
    throw new Error("Failed to generate tinkering activities");
  }
}

export async function generateCustomisedTinkeringActivity(
  input: DetailedTAGenerationInput
): Promise<DetailedGeneratedTA> {
  const { activityIntroduction, aspiration, comments, resources } = input;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
                Introduction: ${activityIntroduction}
                Aspirations: ${aspiration}
                Interests: ${comments}
                ${resources !== "" ? `Resources: ${resources}` : ""}

                Your task is to generate a detailed tinkering activity for the activity based on the provided introduction. Consider his/her aspirations and interests.
                ${resources !== "" ? `The tinkering activity must be confined to the resource provided` : ""}
                It must be short, succinct, clear, concise, and easy to understand.
                It must be creative, fun, engaging, intuitive, and hands-on.
                If required use goals, materials, instructions, tips, observations, extensions, and resources as per the below rule.
                Do not put large sentences or paragraphs. For example - goals, materials, instructions, tips, observations, extensions, and resources (each point must be less than 10 words and a maximum of 3 or 4 bullet points).`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            introduction: { type: Type.STRING },
            goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            observations: { type: Type.ARRAY, items: { type: Type.STRING } },
            extensions: { type: Type.ARRAY, items: { type: Type.STRING } },
            resources: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            "name",
            "introduction",
          ],
          propertyOrdering: [
            "name",
            "introduction",
            "goals",
            "materials",
            "instructions",
            "tips",
            "observations",
            "extensions",
            "resources"
          ]
        }
      }
    });

    const data: DetailedGeneratedTA = JSON.parse(response.text!);
    
    
    const arrayFields: Array<keyof Pick<DetailedGeneratedTA, "goals" | "materials" | "instructions" | "tips" | "observations" | "extensions" | "resources">> = [
      "goals", "materials", "instructions", "tips", "observations", "extensions", "resources"
    ];

    for (const field of arrayFields) {
      if (!Array.isArray(data[field])) {
        (data as any)[field] = [] as string[];
      }
    }

    return data;

  } catch (error) {
    console.error("Error generating detailed tinkering activity:", error);
    throw new Error("Failed to generate detailed tinkering activity");
  }
}
