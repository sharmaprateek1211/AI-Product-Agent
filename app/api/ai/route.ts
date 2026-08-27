import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getOpenAIModel() {
  const raw = (process.env.OPENAI_MODEL || "gpt-4o-mini").trim();
  const normalized = raw.toLowerCase();

  if (
    normalized === "gpt-3.5" ||
    normalized === "gpt-3.5-turbo" ||
    normalized.includes("gpt-3.5")
  ) {
    return {
      model: "gpt-3.5-turbo",
      useResponsesApi: false,
    };
  }

  return {
    model: raw || "gpt-4o-mini",
    useResponsesApi: true,
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      mode,
      url,
      description,
      targetCustomer,
      current,
      instruction,
    } = await req.json();

    if (!url || !description) {
      return NextResponse.json(
        { error: "Website URL and description are required." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing." },
        { status: 500 }
      );
    }

    const prompt =
      mode === "modify"
              ? `Update this product concept based on the user's instruction. Keep useful existing information and return valid JSON only.
      Existing concept: ${JSON.stringify(current)}
      Instruction: ${instruction}
      Return keys: productName, description, targetUsers, problem, keyFeatures, businessModel, improvements, mvpFeatures, navigation, pages, uiDirection.`
              : `You are an AI Product Analyst. Analyze the supplied website and product idea. You may use the URL as contextual input, but do not claim to have browsed content you cannot access. Return valid JSON only.
      Website: ${url}
      Idea: ${description}
      Target customer: ${targetCustomer}
      Return keys: productName, description, targetUsers, problem, keyFeatures, businessModel, improvements, mvpFeatures, navigation, pages, uiDirection.`;

    const { model, useResponsesApi } = getOpenAIModel();

    const endpoint = useResponsesApi
      ? "https://api.openai.com/v1/responses"
      : "https://api.openai.com/v1/chat/completions";

    const body = useResponsesApi
      ? {
          model,
          input: prompt,
        }
      : {
          model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const t = await response.text();

      return NextResponse.json(
        { error: `OpenAI error: ${t}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    const text = useResponsesApi
      ? data.output_text || ""
      : data.choices?.[0]?.message?.content || "";

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = {
        productName: "Generated Product",
        raw: text,
      };
    }

    return NextResponse.json({ result });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}