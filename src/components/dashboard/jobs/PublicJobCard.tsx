import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Job } from "@/types/job";
import Link from "next/link";
import { Briefcase, MapPin, DollarSign, Building } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Props = {
  job: Job & { organization?: { name: string; image_url?: string } };
};

function PublicJobCard({ job }: Props) {
  return (
    <Link href={`/find-jobs/${job.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 h-auto w-full rounded-xl overflow-hidden border border-muted group cursor-pointer bg-white">
        <CardContent className="flex flex-col h-full p-6">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 {job.organization?.image_url ? (
                    <img src={job.organization.image_url} alt={job.organization.name} className="w-10 h-10 rounded-full object-cover border" />
                 ) : (
                    <div className="p-2 bg-indigo-50 rounded-full">
                        <Building className="w-6 h-6 text-indigo-600" />
                    </div>
                 )}
                 <div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                        {job.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{job.organization?.name || "Company Confidential"}</p>
                 </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground mt-4">
               <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>{job.location || "Remote"} {job.is_remote ? '(Remote)' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs">
                    <Briefcase className="w-3 h-3" />
                    <span>{job.employment_type}</span>
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded text-xs">
                        <DollarSign className="w-3 h-3" />
                        <span>{job.salary_range}</span>
                    </div>
                  )}
               </div>
               
               <p className="line-clamp-3 text-sm mt-3 text-gray-600">
                 {job.description}
               </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4 flex justify-between items-center text-xs text-muted-foreground">
             <span className="text-indigo-600 font-medium group-hover:underline">View Details</span>
             <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default PublicJobCard;
