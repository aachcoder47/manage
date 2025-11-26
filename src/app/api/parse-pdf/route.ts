import { NextRequest, NextResponse } from 'next/server';
import { parsePdf } from '@/actions/parse-pdf';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const result = await parsePdf(formData);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to parse PDF' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in PDF parsing API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
