import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const organizationId = requestUrl.searchParams.get('organization_id');
    const supabase = createRouteHandlerClient({ cookies });

    let query = supabase
      .from('job')
      .select('*, organization(name, image_url)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<source>
<publisher>Hiring Platform</publisher>
<publisherurl>${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}</publisherurl>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${jobs?.map((job: any) => {
  const companyName = job.company_name || job.organization?.name || 'Company Name';
  const jobId = job.id;
  // Apply URL points to our platform's job page with tracking
  const applyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/find-jobs/${jobId}?source=xml_feed`;
  
  return `<job>
    <title><![CDATA[${job.title}]]></title>
    <date><![CDATA[${new Date(job.created_at).toUTCString()}]]></date>
    <referencenumber><![CDATA[${jobId}]]></referencenumber>
    <url><![CDATA[${applyUrl}]]></url>
    <company><![CDATA[${companyName}]]></company>
    <city><![CDATA[${job.location || 'Remote'}]]></city>
    <description><![CDATA[
      ${job.description || ''}
      ${job.requirements ? `<br/><br/><strong>Requirements:</strong><br/>${job.requirements}` : ''}
      ${job.company_description ? `<br/><br/><strong>About Company:</strong><br/>${job.company_description}` : ''}
    ]]></description>
    <salary><![CDATA[${job.salary_range || ''}]]></salary>
    <country><![CDATA[IN]]></country>
    <remote><![CDATA[${job.is_remote ? 'true' : 'false'}]]></remote>
</job>`;
}).join('\n')}
</source>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error generating XML feed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
