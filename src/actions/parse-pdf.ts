"use server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function parsePdfFromBuffer(buffer: Buffer | ArrayBuffer, fileName: string = "document.pdf"): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
        const blob = new Blob([buffer as any], { type: "application/pdf" });
        const loader = new PDFLoader(blob, { splitPages: false });
        const docs = await loader.load();
        
        if (!docs || docs.length === 0) {throw new Error("No content found");}
        
        const fullText = docs.map((doc: any) => doc.pageContent).join("\n").trim();
         if (!fullText || fullText.length < 10) {throw new Error("PDF seems empty");}

        return { success: true, text: fullText };
    } catch (error: any) {
        console.error("PDF Parse Error:", error);
         return { success: false, error: error.message };
    }
}

export async function parsePdf(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    const arrayBuffer = await file.arrayBuffer();
    
    // Use the shared function
    const result = await parsePdfFromBuffer(arrayBuffer, file.name);
    
    if (!result.success) {throw new Error(result.error);}

    return {
      success: true,
      text: result.text,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        textLength: result.text?.length || 0,
        parsingMethod: "langchain-pdf-loader"
      }
    };
  } catch (error) {
     // ... (Keep existing error handling wrapper if generic or simplify)
     return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
     }
  }
}
