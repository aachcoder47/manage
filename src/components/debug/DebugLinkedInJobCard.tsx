// Debug LinkedIn JobCard component
// This will help identify why LinkedIn links are not showing

import React, { useEffect, useState } from 'react';

interface DebugLinkedInJobCardProps {
  jobId: string;
}

interface ExternalPost {
  id: string;
  platform: string;
  posting_status: string;
  external_job_url: string;
  [key: string]: any;
}

interface DebugInfo {
  fetching: boolean;
  posts: ExternalPost[];
  linkedinPosts?: ExternalPost[];
  error: string | null;
  jobId: string;
}

const DebugLinkedInJobCard = ({ jobId }: DebugLinkedInJobCardProps) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    fetching: false,
    posts: [],
    linkedinPosts: [],
    error: null,
    jobId: jobId
  });

  useEffect(() => {
    const fetchExternalPosts = async () => {
      setDebugInfo(prev => ({ ...prev, fetching: true, error: null }));
      
      try {
        console.log('🔍 Fetching external posts for job:', jobId);
        const response = await fetch(`/api/jobs/${jobId}/external-posts`);
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          setDebugInfo(prev => ({ ...prev, error: errorText, fetching: false }));
          return;
        }
        
        const data = await response.json();
        console.log('📊 API Response data:', data);
        
        const linkedinPosts = data.posts?.filter((post: any) => post.platform === 'linkedin') || [];
        console.log('🔗 LinkedIn posts found:', linkedinPosts);
        
        setDebugInfo(prev => ({
          ...prev,
          posts: data.posts || [],
          linkedinPosts,
          fetching: false
        }));
        
      } catch (error: any) {
        console.error('❌ Fetch error:', error);
        setDebugInfo(prev => ({
          ...prev,
          error: error.message || 'Unknown error',
          fetching: false
        }));
      }
    };

    if (jobId) {
      fetchExternalPosts();
    }
  }, [jobId]);

  const linkedinPost = debugInfo.posts?.find(post => post.platform === 'linkedin');

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h4>🔍 LinkedIn Debug Info</h4>
      <div>Job ID: {debugInfo.jobId}</div>
      <div>Fetching: {debugInfo.fetching ? 'Yes' : 'No'}</div>
      <div>Total Posts: {debugInfo.posts.length}</div>
      <div>LinkedIn Posts: {debugInfo.linkedinPosts?.length || 0}</div>
      
      {linkedinPost && (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0, 255, 0, 0.2)', borderRadius: '4px' }}>
          <div>✅ LinkedIn Post Found!</div>
          <div>ID: {linkedinPost.id}</div>
          <div>Status: {linkedinPost.posting_status}</div>
          <div>URL: {linkedinPost.external_job_url}</div>
        </div>
      )}
      
      {debugInfo.error && (
        <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255, 0, 0, 0.2)', borderRadius: '4px' }}>
          <div>❌ Error: {debugInfo.error}</div>
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '10px' }}>
        <div>🔍 Check console for detailed logs</div>
        <div>📊 API Response logged above</div>
      </div>
    </div>
  );
};

// Export for use in components
if (typeof window !== 'undefined') {
  (window as any).DebugLinkedInJobCard = DebugLinkedInJobCard;
  console.log('🔧 LinkedIn debug component loaded. Use <DebugLinkedInJobCard jobId="your-job-id" /> in your component.');
}

export default DebugLinkedInJobCard;
