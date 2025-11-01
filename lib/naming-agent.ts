import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

import { domainrSearch } from "@/lib/domainr";
import { NamingRequest, namingResponseSchema } from "@/lib/schemas";

const DomainSearchInputSchema = z.object({
  query: z.string().describe("The name or domain fragment to search for."),
  defaults: z
    .array(z.string())
    .optional()
    .describe("Preferred top-level domains without a leading dot."),
  registrar: z.string().optional(),
  location: z.string().optional(),
});

const domainSearchTool = new DynamicStructuredTool({
  name: "domainr_search",
  description:
    "Use this tool to look up domain availability for a candidate brand name. You must call this for each shortlisted suggestion before finalizing your answer.",
  schema: DomainSearchInputSchema,
  func: async ({ query, defaults, registrar, location }) => {
    const response = await domainrSearch({
      query,
      defaults,
      registrar,
      location,
    });

    return JSON.stringify(response);
  },
});

const MODEL_NAME = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function messagesToStringContent(message: AIMessage) {
  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((chunk) => (typeof chunk === "string" ? chunk : chunk.text ?? ""))
      .join("\n");
  }

  return "";
}

function sanitizeJsonString(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  }

  return trimmed;
}

type ToolMap = Record<string, typeof domainSearchTool>;

export async function generateNamingIdeas(input: NamingRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const model = new ChatOpenAI({
    model: MODEL_NAME,
    temperature: 0.8,
    maxTokens: 900,
    apiKey,
  }).bindTools([domainSearchTool]);

  const tools: ToolMap = {
    [domainSearchTool.name]: domainSearchTool,
  };

  const baseMessages = [
    new SystemMessage(
      "You are BrandSmith, an elite naming strategist. Craft distinct, future-proof brand name ideas tailored to the provided idea and constraints. Each suggestion must honour tone, length, and strategic cues. ALWAYS verify domains via the `domainr_search` tool before responding. Return JSON that matches the supplied schema.",
    ),
    new HumanMessage(
      `Project idea: ${input.ideaSummary}\nTarget audience: ${input.targetAudience}\nTone: ${input.tone}\nMust-have keywords: ${input.keywords.join(", ") || "(none)"}\nPreferred TLDs: ${input.tldPreferences.join(", ")}\nLength range: ${input.lengthRange[0]}-${input.lengthRange[1]} characters\nExact-match required: ${input.requireExactDomain ? "yes" : "no"}\nInternational reach priority: ${input.preferInternational ? "yes" : "no"}\nSEO emphasis: ${input.seoFocus ? "yes" : "no"}.\nRegistrar preference: ${input.registrar}.\nLocation hint: ${input.location}.\n` +
        "Return between 3 and 5 high-concept suggestions. Include tagline-sized positioning statements. Provide domain availability summaries using the tool results. Offer next-step advice for refinement.",
    ),
  ];

  const conversation: (SystemMessage | HumanMessage | AIMessage | ToolMessage)[] = [
    ...baseMessages,
  ];

  let aiMessage = await model.invoke(conversation);

  while (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
    conversation.push(aiMessage);

    for (const call of aiMessage.tool_calls) {
      const tool = tools[call.name];

      if (!tool) {
        continue;
      }

      const parsedArgs = DomainSearchInputSchema.safeParse(call.args);

      const candidateDefaults = input.tldPreferences.map((tld) =>
        tld.replace(/^\./, ""),
      );

      const toolResult = await tool.invoke({
        query: parsedArgs.success ? parsedArgs.data.query : String(call.args?.query ?? ""),
        defaults:
          parsedArgs.success && parsedArgs.data.defaults?.length
            ? parsedArgs.data.defaults
            : candidateDefaults,
        registrar:
          parsedArgs.success && parsedArgs.data.registrar
            ? parsedArgs.data.registrar
            : input.registrar,
        location:
          parsedArgs.success && parsedArgs.data.location
            ? parsedArgs.data.location
            : input.location,
      });

      conversation.push(
        new ToolMessage({
          tool_call_id: call.id,
          name: call.name,
          content: typeof toolResult === "string" ? toolResult : JSON.stringify(toolResult),
        }),
      );
    }

    aiMessage = await model.invoke(conversation);
  }

  const content = sanitizeJsonString(messagesToStringContent(aiMessage));

  let rawJson: unknown;

  try {
    rawJson = JSON.parse(content);
  } catch {
    throw new Error("Model response was not valid JSON");
  }

  const parsed = namingResponseSchema.safeParse(rawJson);

  if (!parsed.success) {
    throw new Error("Failed to parse model response");
  }

  return parsed.data;
}

