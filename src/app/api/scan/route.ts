import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

const scanResultSchema = z.object({
    name: z.string().describe("A suitable name for this gym location based on the image"),
    description: z.string().describe("A brief description of the space"),
    equipment: z.array(z.object({
        name: z.string().describe("Name of the equipment"),
        notes: z.string().optional().describe("Details like weight range, brand, or type"),
    })),
});

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return new Response('No image provided', { status: 400 });
        }

        // Remove data URL prefix if present for the SDK
        const base64Image = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

        const { object } = await generateObject({
            model: google('gemini-2.0-flash-exp'), // Using latest available alias for V2/V3 features
            schema: scanResultSchema,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this gym image. Identify the gym type (Home, Commercial, etc.) and list all visible workout equipment. Be thorough.' },
                        { type: 'image', image: base64Image },
                    ],
                },
            ],
        });

        return Response.json(object);
    } catch (error) {
        console.error('Scan error:', error);
        return new Response('Failed to scan image', { status: 500 });
    }
}
