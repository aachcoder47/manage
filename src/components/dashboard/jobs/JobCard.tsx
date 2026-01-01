import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Job } from "@/types/job";
import Link from "next/link";
import { Briefcase, MapPin, DollarSign, Eye, ExternalLink, Linkedin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Props = {
  job: Job;
};

function JobCard({ job }: Props) {
  const [externalPosts, setExternalPosts] = React.useState<any[]>([]);
  const [loadingExternal, setLoadingExternal] = React.useState(false);

  React.useEffect(() => {
    const fetchExternalPosts = async () => {
      if (!job.id) return;
      
      setLoadingExternal(true);
      try {
        const response = await fetch(`/api/jobs/${job.id}/external-posts`);
        const data = await response.json();
        setExternalPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching external posts:", error);
      } finally {
        setLoadingExternal(false);
      }
    };

    fetchExternalPosts();
  }, [job.id]);

  const getLinkedInPost = () => {
    return externalPosts.find(post => post.platform === 'linkedin');
  };

  const linkedinPost = getLinkedInPost();
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 h-72 w-full rounded-xl overflow-hidden border border-muted group cursor-pointer">
        <CardContent className="flex flex-col h-full p-6">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                <Eye className="w-3 h-3" />
                {job.views}
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {job.title}
            </h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              {job.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{job.location} {job.is_remote ? '(Remote)' : ''}</span>
                </div>
              )}
              {job.salary_range && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-4 flex justify-between items-center text-xs text-muted-foreground">
            <span className={`px-2 py-1 rounded-full ${
              job.status === 'open' ? 'bg-green-50 text-green-700 border-green-200 border' :
              job.status === 'closed' ? 'bg-red-50 text-red-700 border-red-200 border' :
              'bg-gray-50 text-gray-700 border-gray-200 border'
            }`}>
              {job.status.toUpperCase()}
            </span>
            <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
          </div>

          {/* LinkedIn Post Link Section */}
          {linkedinPost && linkedinPost.external_job_url && (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Linkedin className="w-4 h-4" />
                  <span>Posted on LinkedIn</span>
                </div>
                <a
                  href={linkedinPost.external_job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View
                </a>
              </div>
            </div>
          )}

          {/* Loading state for external posts */}
          {loadingExternal && (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin" />
                <span>Checking external posts...</span>
              </div>
            </div>
          )}

          {/* No external posts state */}
          {!loadingExternal && externalPosts.length === 0 && (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>No external posts yet</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export default JobCard;
