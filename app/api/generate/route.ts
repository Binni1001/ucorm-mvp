import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const reviewText = body.reviewText;

    const prompt = `
You are a hotel customer support assistant.

Generate 3 different responses to this review:
1. Professional
2. Friendly
3. Apology-focused

Review:
"${reviewText}"

Return ONLY valid JSON in this format:

{
  "professional": "...",
  "friendly": "...",
  "apology": "..."
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content =
      completion.choices[0].message.content;

    return NextResponse.json(
      JSON.parse(content || "{}")
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}