import { NextResponse } from "next/server";
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

      return NextResponse.json(transformedActivities);
    }

    const tinkeringActivities = await getTinkeringActivitiesBySubtopic(
      parseInt(subtopicId)
    );
    return NextResponse.json(tinkeringActivities);
  } catch (error) {
    console.error("Error fetching tinkering activities:", error);
    return NextResponse.json(
      { message: "Error fetching tinkering activities" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const result = tinkeringActivitySchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;
    const tinkeringActivity = await createTinkeringActivity(validatedData);

    return NextResponse.json(tinkeringActivity);
  } catch (error) {
    console.error("Error creating tinkering activity:", error);
    return NextResponse.json(
      { message: "Error creating tinkering activity" },
      { status: 500 }
    );
  }
}
