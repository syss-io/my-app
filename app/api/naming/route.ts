import { ZodError } from "zod";
import { NextResponse } from "next/server";

import { generateNamingIdeas } from "@/lib/naming-agent";
import { namingRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = namingRequestSchema.parse(payload);
    const result = await generateNamingIdeas(input);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Invalid request payload" }, { status: 400 });
    }

    console.error("Naming API error", error);

    return NextResponse.json(
      { message: "Unable to generate naming ideas at this time." },
      { status: 500 },
    );
  }
}

