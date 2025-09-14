import { failure, success } from "@/lib/api/http";
import {
  createTinkeringActivity,
  getTinkeringActivitiesBySubtopic,
  getAllTinkeringActivities,
} from "@/lib/db/tinkering-activity/crud";
import { TinkeringActivityWithSubtopic } from "@/lib/db/tinkering-activity/type";
import { tinkeringActivitySchema } from "@/lib/db/tinkering-activity/type";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subtopicId = searchParams.get("subtopicId");

    if (!subtopicId) {
      const tinkeringActivities =
        (await getAllTinkeringActivities()) as TinkeringActivityWithSubtopic[];

      const transformedActivities = tinkeringActivities.map((activity) => {
        return {
          ...activity,
          subtopic_name: activity.subtopic?.subtopic_name || null,
          topic_name: activity.subtopic?.topic?.topic_name || null,
          subject_name: activity.subtopic?.topic?.subject?.subject_name || null,
        };
      });

      return success(transformedActivities);
    }

    const tinkeringActivities = await getTinkeringActivitiesBySubtopic(
      parseInt(subtopicId)
    );
    return success(tinkeringActivities);
  } catch (error) {
    console.error("Error fetching tinkering activities:", error);
    return failure("Error fetching tinkering activities", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const result = tinkeringActivitySchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const validatedData = result.data;
    const payload = { ...validatedData, type: "default" } as const;
    const tinkeringActivity = await createTinkeringActivity(payload);

    return success(tinkeringActivity);
  } catch (error) {
    console.error("Error creating tinkering activity:", error);
    return failure("Error creating tinkering activity", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
