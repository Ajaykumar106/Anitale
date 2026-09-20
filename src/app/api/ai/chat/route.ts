import { neon } from '@neon/ai-sdk-provider';
import { streamText } from 'ai';

export const maxDuration = 30; // 30 seconds

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // If the Neon AI Gateway vars aren't set in the environment, we'll gracefully fallback
    // to returning an error message in the stream, since they need a paid plan.
    if (!process.env.NEON_AI_GATEWAY_TOKEN) {
      return new Response(
        JSON.stringify({
          error: "Neon AI Gateway requires a paid Neon plan to provision. Please enable it in neon.ts and deploy.",
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: neon("claude-sonnet-4-6"), // Using a great model for recommendations
      system: `You are the "Anime Sommelier" on Anitale, a premium anime/movie streaming platform. 
      Your job is to recommend anime, movies, and TV series based on the user's prompt. 
      Keep your responses concise, friendly, and formatted nicely. Only talk about media (movies, shows, anime).`,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Chat Error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch AI response" }), { status: 500 });
  }
}
