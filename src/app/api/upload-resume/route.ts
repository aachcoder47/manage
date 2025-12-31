import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration');
    return NextResponse.json(
      { error: 'Server configuration error: Missing database credentials' },
      { status: 500 }
    );
  }

  console.log('Supabase URL:', supabaseUrl);
  console.log('Service Role Key:', supabaseKey ? 'Present' : 'Missing');

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:', file.name, file.type, file.size);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Attempting upload to bucket: resumes, file:', filePath);

    const { data, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error details:', {
        message: uploadError.message,
        error: uploadError
      });
      
      // Specific error handling
      if (uploadError.message.includes('403') || uploadError.message.includes('signature')) {
        return NextResponse.json({ 
          error: 'Storage permission denied. Please check Supabase storage policies and bucket permissions.',
          details: 'The service role key may not have upload permissions for the resumes bucket.'
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: uploadError.message,
        details: 'Upload failed - check storage bucket and policies'
      }, { status: 500 });
    }

    console.log('Upload successful:', data);

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    console.log('Public URL generated:', urlData.publicUrl);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath,
      success: true
    });

  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
