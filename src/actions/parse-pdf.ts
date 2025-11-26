"use server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function parsePdf(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error("Invalid file type. Please upload a PDF file.");
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error("File too large. Please upload a PDF smaller than 10MB.");
    }

    console.log("Parsing PDF:", file.name, "Size:", file.size, "Type:", file.type);

    // Convert File to Buffer for PDFLoader
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    // Try multiple parsing methods
    let fullText = "";
    let docs: any[] = [];

    try {
      // Method 1: Try PDFLoader with file object
      const loader = new PDFLoader(file, {
        splitPages: false,
      });
      docs = await loader.load();
      console.log("PDFLoader with file object succeeded");
    } catch (error1) {
      console.log("PDFLoader with file failed, trying blob method:", error1);
      
      try {
        // Method 2: Try PDFLoader with blob
        const loader = new PDFLoader(blob, {
          splitPages: false,
        });
        docs = await loader.load();
        console.log("PDFLoader with blob succeeded");
      } catch (error2) {
        console.log("PDFLoader with blob failed, trying split pages:", error2);
        
        try {
          // Method 3: Try with split pages
          const loader = new PDFLoader(file);
          docs = await loader.load();
          console.log("PDFLoader with split pages succeeded");
        } catch (error3) {
          console.log("All PDFLoader methods failed:", error3);
          throw new Error("Unable to parse PDF. The file might be corrupted, password-protected, or in an unsupported format.");
        }
      }
    }
    
    if (!docs || docs.length === 0) {
      throw new Error("No content found in PDF");
    }

    fullText = docs.map((doc: any) => doc.pageContent).join("\n").trim();

    if (!fullText || fullText.length < 10) {
      throw new Error("PDF appears to be empty or contains no readable text. This might happen with image-only PDFs or scanned documents.");
    }

    console.log("Successfully parsed PDF, text length:", fullText.length);

    return {
      success: true,
      text: fullText,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        pages: docs.length,
        textLength: fullText.length,
        parsingMethod: "langchain-pdf-loader"
      }
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    
    let errorMessage = "Failed to parse PDF";
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid file type')) {
        errorMessage = "Please upload a valid PDF file";
      } else if (error.message.includes('File too large')) {
        errorMessage = "File size exceeds 10MB limit";
      } else if (error.message.includes('empty') || error.message.includes('no readable text')) {
        errorMessage = "PDF is empty or contains no readable text. This might happen with image-only PDFs or scanned documents. Please ensure the PDF has selectable text.";
      } else if (error.message.includes('password')) {
        errorMessage = "PDF is password protected. Please upload an unprotected PDF.";
      } else if (error.message.includes('corrupted') || error.message.includes('damaged')) {
        errorMessage = "PDF appears to be corrupted. Please try a different file.";
      } else if (error.message.includes('Unable to parse PDF')) {
        errorMessage = "Unable to parse PDF. The file might be corrupted, password-protected, or in an unsupported format.";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        "Ensure the PDF contains selectable text (not just images)",
        "Check if the PDF is password protected",
        "Try saving the PDF with a different tool",
        "Verify the file is not corrupted"
      ]
    };
  }
}
