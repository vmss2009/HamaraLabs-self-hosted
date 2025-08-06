import { prisma } from "@/lib/db/prisma";
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

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export async function createCustomisedTinkeringActivity(
  data: CustomisedTinkeringActivityCreateInput
): Promise<CustomisedTinkeringActivityWithRelations> {
  return prisma.customisedTinkeringActivity.create({
    data: {
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
      base_ta_id: data.base_ta_id,
      student_id: data.student_id,
      status: data.status,
    },
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

export async function getCustomisedTinkeringActivities(
  filter?: CustomisedTinkeringActivityFilter
): Promise<CustomisedTinkeringActivityWithRelations[]> {
  const where: any = {};

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
    },
  });
}

export async function updateCustomisedTinkeringActivity(
  id: string,
  data: Partial<CustomisedTinkeringActivityCreateInput>
): Promise<CustomisedTinkeringActivityWithRelations> {
  return prisma.customisedTinkeringActivity.update({
    where: { id },
    data: {
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
      base_ta_id: data.base_ta_id,
      student_id: data.student_id,
      status: data.status,
    },
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

  const updatedData = previousActivities.map((obj: any) =>
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
    
    const arrayFields: (keyof DetailedGeneratedTA)[] = [
      "goals", "materials", "instructions", "tips", "observations", "extensions", "resources"
    ];
    
    arrayFields.forEach(field => {
      if (!Array.isArray(data[field])) {
        (data as any)[field] = [];
      }
    });

    return data;

  } catch (error) {
    console.error("Error generating detailed tinkering activity:", error);
    throw new Error("Failed to generate detailed tinkering activity");
  }
}
