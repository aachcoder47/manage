// src/app/api/test-ai/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const mistral = getMistral();
    
    if (!mistral) {
      return NextResponse.json({ 
        error: "Mistral AI service not available",
        details: "MISTRAL_API_KEY environment variable is missing"
      }, { status: 500 });
    }

    // Test simple AI call
    const response = await mistral.chat.complete({
      model: "mistral-7b",
      messages: [{ 
        role: "user", 
        content: "Respond with 'AI service is working' in JSON format like {\"status\": \"working\"}" 
      }],
      maxTokens: 50,
    });

    const messageContent = response.choices[0].message.content;
    const contentString = Array.isArray(messageContent) 
      ? messageContent.join('') 
      : (messageContent || '{}');

    let result;
    try {
      result = JSON.parse(contentString);
    } catch (parseError) {
      result = { 
        status: "working", 
        raw_response: contentString,
        note: "Response parsed as text due to JSON parsing error"
      };
    }

    return NextResponse.json({
      success: true,
      ai_service: "Mistral",
      model: "mistral-7b",
      result: result,
      message: "AI service test completed successfully"
    });

  } catch (error: any) {
    console.error('AI service test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      error_type: error.name,
      message: "AI service test failed"
    }, { status: 500 });
  }
}

function getMistral() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {return null;}
  return new Mistral({ apiKey });
}
