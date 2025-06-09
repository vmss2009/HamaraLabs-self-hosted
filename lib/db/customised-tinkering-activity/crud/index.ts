import { prisma } from "@/lib/db/prisma";
import { 
  CustomisedTinkeringActivityCreateInput, 
  CustomisedTinkeringActivityFilter, 
  CustomisedTinkeringActivityWithRelations 
} from "../type";

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
      }
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
      }
    },
  });
} 