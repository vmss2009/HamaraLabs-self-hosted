import { failure, success } from "@/lib/api/http";
import { createSubtopic, getSubtopicsByTopic } from "@/lib/db/tinkering-activity/crud";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    
    if (!topicId) {
      return failure("Topic ID is required", 400, { code: "MISSING_PARAM" });
    }
    
    const subtopics = await getSubtopicsByTopic(parseInt(topicId));
    return success(subtopics);
  } catch (error) {
    console.error("Error fetching subtopics:", error);
    return failure("Error fetching subtopics", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const subtopic = await createSubtopic(data);
    return success(subtopic);
  } catch (error) {
    console.error("Error creating subtopic:", error);
    return failure("Error creating subtopic", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
} 
