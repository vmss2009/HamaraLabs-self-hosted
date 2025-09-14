import { failure, success } from "@/lib/api/http";
import { createTopic, getTopicsBySubject } from "@/lib/db/tinkering-activity/crud";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    
    if (!subjectId) {
      return failure("Subject ID is required", 400, { code: "MISSING_PARAM" });
    }
    
    const topics = await getTopicsBySubject(parseInt(subjectId));
    return success(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return failure("Error fetching topics", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const topic = await createTopic(data);
    return success(topic);
  } catch (error) {
    console.error("Error creating topic:", error);
    return failure("Error creating topic", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
} 
