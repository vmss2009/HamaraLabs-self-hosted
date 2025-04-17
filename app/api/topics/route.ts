import { NextResponse } from "next/server";
import { createTopic, getTopicsBySubject } from "@/lib/db/tinkering-activity/crud";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    
    if (!subjectId) {
      return NextResponse.json(
        { message: "Subject ID is required" },
        { status: 400 }
      );
    }
    
    const topics = await getTopicsBySubject(parseInt(subjectId));
    return NextResponse.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { message: "Error fetching topics" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const topic = await createTopic(data);
    return NextResponse.json(topic);
  } catch (error) {
    console.error("Error creating topic:", error);
    return NextResponse.json(
      { message: "Error creating topic" },
      { status: 500 }
    );
  }
} 