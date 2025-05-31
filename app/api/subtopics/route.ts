import { NextResponse } from "next/server";
import {
  createSubtopic,
  getSubtopicsByTopic,
} from "@/lib/db/tinkering-activity/crud";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get("topicId");

    if (!topicId) {
      return NextResponse.json(
        { message: "Topic ID is required" },
        { status: 400 },
      );
    }

    const subtopics = await getSubtopicsByTopic(parseInt(topicId));
    return NextResponse.json(subtopics);
  } catch (error) {
    console.error("Error fetching subtopics:", error);
    return NextResponse.json(
      { message: "Error fetching subtopics" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const subtopic = await createSubtopic(data);
    return NextResponse.json(subtopic);
  } catch (error) {
    console.error("Error creating subtopic:", error);
    return NextResponse.json(
      { message: "Error creating subtopic" },
      { status: 500 },
    );
  }
}
