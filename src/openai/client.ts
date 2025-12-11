import OpenAI from "openai";

let runtimeApiKey: string | undefined;

export function setOpenAIApiKey(key: string): void {
  runtimeApiKey = key;
}

export function getOpenAIApiKey(): string | undefined {
  return runtimeApiKey || process.env.OPENAI_API_KEY;
}

export function getOpenAIClient(): OpenAI {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new OpenAIConfigError(
      "OpenAI API key not configured. Set OPENAI_API_KEY environment variable or use configure_openai tool.",
      "API_KEY_MISSING"
    );
  }
  return new OpenAI({ apiKey });
}

export class OpenAIConfigError extends Error {
  constructor(
    message: string,
    public code: "API_KEY_MISSING" | "API_ERROR" | "RATE_LIMIT" | "PARSE_ERROR" | "TIMEOUT"
  ) {
    super(message);
    this.name = "OpenAIConfigError";
  }
}

export type DeepResearchModel =
  | "o3-deep-research-2025-06-26"
  | "o4-mini-deep-research-2025-06-26";

export interface DeepResearchOptions {
  model: DeepResearchModel;
  systemPrompt: string;
  userPrompt: string;
}

export interface RawCitation {
  title: string;
  url: string;
  startIndex: number;
  endIndex: number;
}

export interface DeepResearchResult {
  content: string;
  citations: RawCitation[];
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export async function executeDeepResearch(
  options: DeepResearchOptions
): Promise<DeepResearchResult> {
  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: options.model,
    input: [
      {
        role: "developer",
        content: [{ type: "input_text", text: options.systemPrompt }],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: options.userPrompt }],
      },
    ],
    tools: [{ type: "web_search_preview" }],
  });

  // Extract the final text content
  const outputItems = response.output || [];
  let content = "";
  const citations: RawCitation[] = [];

  for (const item of outputItems) {
    if (item.type === "message" && item.content) {
      for (const contentItem of item.content) {
        if (contentItem.type === "output_text") {
          content += contentItem.text;

          // Extract citations from annotations
          const annotations = contentItem.annotations || [];
          for (const annotation of annotations) {
            if (annotation.type === "url_citation") {
              citations.push({
                title: annotation.title || "Untitled",
                url: annotation.url,
                startIndex: annotation.start_index,
                endIndex: annotation.end_index,
              });
            }
          }
        }
      }
    }
  }

  return {
    content,
    citations,
    usage: {
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      totalTokens:
        (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
    },
  };
}
