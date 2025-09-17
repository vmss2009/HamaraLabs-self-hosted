import { chatBus } from '@/lib/chat/realtime';
import { auth } from '@/lib/auth/auth';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const session = await auth();
  if(!session?.user?.id) return new Response('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url, BASE_URL);
  const roomId = searchParams.get('roomId');
  if(!roomId) return new Response('roomId required', { status: 400 });

  const stream = new ReadableStream({
    start(controller) {
      const listener = (payload: any) => {
        if(payload.roomId === roomId) {
          controller.enqueue(new TextEncoder().encode(`event: message\ndata: ${JSON.stringify(payload)}\n\n`));
        }
      };
      chatBus.on('message', listener);
      controller.enqueue(new TextEncoder().encode(`event: open\ndata: {"status":"ok"}\n\n`));
      const heartbeat = setInterval(() => {
        controller.enqueue(new TextEncoder().encode(`event: ping\ndata: {}\n\n`));
      }, 30000);
      (req as any).signal?.addEventListener('abort', () => {
        clearInterval(heartbeat);
        chatBus.off('message', listener);
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}