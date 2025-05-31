import { prisma } from "@/lib/db/prisma";
import {
  SubjectCreateInput,
  TopicCreateInput,
  SubtopicCreateInput,
  TinkeringActivityCreateInput,
  TinkeringActivityWithSubtopic,
} from "../type";
import { tinkeringActivitySchema } from "../type";

export async function createSubject(data: SubjectCreateInput) {
  try {
    const subject = await prisma.subject.create({
      data: {
        subject_name: data.subject_name,
      },
    });

    return subject;
  } catch (error) {
    console.error("Error creating subject:", error);
    throw error;
  }
}

export async function getSubjects() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        subject_name: "asc",
      },
    });

    return subjects;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
}

export async function createTopic(data: TopicCreateInput) {
  try {
    const topic = await prisma.topic.create({
      data: {
        topic_name: data.topic_name,
        subject_id: data.subjectId,
      },
    });

    return topic;
  } catch (error) {
    console.error("Error creating topic:", error);
    throw error;
  }
}

export async function getTopicsBySubject(subjectId: number) {
  try {
    const topics = await prisma.topic.findMany({
      where: {
        subject_id: subjectId,
      },
      orderBy: {
        topic_name: "asc",
      },
    });

    return topics;
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw error;
  }
}

export async function createSubtopic(data: SubtopicCreateInput) {
  try {
    const subtopic = await prisma.subtopic.create({
      data: {
        subtopic_name: data.subtopic_name,
        topic_id: data.topicId,
      },
    });

    return subtopic;
  } catch (error) {
    console.error("Error creating subtopic:", error);
    throw error;
  }
}

export async function getSubtopicsByTopic(topicId: number) {
  try {
    const subtopics = await prisma.subtopic.findMany({
      where: {
        topic_id: topicId,
      },
      orderBy: {
        subtopic_name: "asc",
      },
    });

    return subtopics;
  } catch (error) {
    console.error("Error fetching subtopics:", error);
    throw error;
  }
}

export async function createTinkeringActivity(data: unknown) {
  try {
    const result = tinkeringActivitySchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      console.error("Validation failed:", errorMessages);
      throw new Error(errorMessages[0]);
    }

    const validatedData = result.data;

    const tinkeringActivity = await prisma.tinkeringActivity.create({
      data: {
        name: validatedData.name,
        subtopic_id: validatedData.subtopicId,
        introduction: validatedData.introduction,
        goals: validatedData.goals,
        materials: validatedData.materials,
        instructions: validatedData.instructions,
        tips: validatedData.tips,
        observations: validatedData.observations,
        extensions: validatedData.extensions,
        resources: validatedData.resources,
      },
    });

    return tinkeringActivity;
  } catch (error) {
    console.error("Error creating tinkering activity:", error);
    throw error;
  }
}

export async function getTinkeringActivitiesBySubtopic(subtopicId: number) {
  try {
    const tinkeringActivities = await prisma.tinkeringActivity.findMany({
      where: {
        subtopic_id: subtopicId,
      },
      include: {
        subtopic: {
          include: {
            topic: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    return tinkeringActivities;
  } catch (error) {
    console.error("Error fetching tinkering activities:", error);
    throw error;
  }
}

export async function getAllTinkeringActivities(): Promise<
  TinkeringActivityWithSubtopic[]
> {
  try {
    const tinkeringActivities = (await prisma.tinkeringActivity.findMany({
      include: {
        subtopic: {
          include: {
            topic: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    })) as unknown as TinkeringActivityWithSubtopic[];

    return tinkeringActivities;
  } catch (error) {
    console.error("Error fetching all tinkering activities:", error);
    throw error;
  }
}

export async function getTinkeringActivityById(
  id: number
): Promise<TinkeringActivityWithSubtopic | null> {
  try {
    const tinkeringActivity = (await prisma.tinkeringActivity.findUnique({
      where: { id },
      include: {
        subtopic: {
          include: {
            topic: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    })) as TinkeringActivityWithSubtopic | null;

    return tinkeringActivity;
  } catch (error) {
    console.error(`Error fetching tinkering activity with id ${id}:`, error);
    throw error;
  }
}
export async function updateTinkeringActivity(id: number, data: unknown) {
  try {
    const result = tinkeringActivitySchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      console.error("Validation failed:", errorMessages);
      throw new Error("Validation error: " + errorMessages.join(", "));
    }

    const validatedData = result.data;

    const tinkeringActivity = (await prisma.tinkeringActivity.update({
      where: { id },
      data: {
        name: validatedData.name,
        subtopic_id: validatedData.subtopicId,
        introduction: validatedData.introduction,
        goals: validatedData.goals,
        materials: validatedData.materials,
        instructions: validatedData.instructions,
        tips: validatedData.tips,
        observations: validatedData.observations,
        extensions: validatedData.extensions,
        resources: validatedData.resources,
      },
      include: {
        subtopic: {
          include: {
            topic: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    })) as TinkeringActivityWithSubtopic;

    return tinkeringActivity;
  } catch (error) {
    console.error(`Error updating tinkering activity with id ${id}:`, error);
    throw error;
  }
}

export async function deleteTinkeringActivity(id: number) {
  try {
    await prisma.tinkeringActivity.delete({
      where: { id },
    });
  } catch (error) {
    console.error(`Error deleting tinkering activity with id ${id}:`, error);
    throw error;
  }
}
