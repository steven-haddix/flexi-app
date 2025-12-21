import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { equipment, goals, experienceLevel } = await req.json();

        if (!equipment || !Array.isArray(equipment)) {
            return new Response('Invalid equipment list', { status: 400 });
        }

        const result = streamText({
            model: google('gemini-2.0-flash-exp'),
            system: 'You are an expert fitness coach. Create workouts based strictly on available equipment.',
            prompt: `
        Create a complete workout session.
        
        **Context:**
        - Available Equipment: ${equipment.map((e: any) => e.name).join(', ') || 'Bodyweight only'}
        - User Goals: ${goals || 'General fitness'}
        - Experience Level: ${experienceLevel || 'Intermediate'}

        **Instructions:**
        1. Start with a warm-up.
        2. List exercises with sets and reps.
        3. Explain *why* this workout fits the equipment.
        4. Keep it concise but motivating.
        5. Format using Markdown.
      `,
        });

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Workout generation error:', error);
        return new Response('Failed to generate workout', { status: 500 });
    }
}
