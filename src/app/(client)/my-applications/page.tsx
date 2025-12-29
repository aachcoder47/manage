"use client";

import React, { useEffect, useState } from "react";
import { ApplicationsService } from "@/services/applications.service";
import { JobApplication } from "@/types/application";
import { useUser } from "@clerk/nextjs";
import { Loader2, Building, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

export default function MyApplicationsPage() {
  const { user } = useUser();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      if (user) {
        try {
          const data = await ApplicationsService.getApplicationsByCandidate(user.id);
          setApplications(data);
        } catch (error) {
          console.error("Error fetching applications:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchApps();
    }
  }, [user]);

  if (!user) return <div className="p-10 text-center">Please sign in.</div>;
  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Applications</h1>

      <div className="grid gap-4">
        {applications.length > 0 ? (
          applications.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col md:flex-row items-center justify-between p-6">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <Building className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">{app.job?.title}</h3>
                     <p className="text-muted-foreground">{app.job?.organization?.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end text-sm text-muted-foreground text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
                    </div>
                    {app.resume_url && (
                        <a href={app.resume_url} target="_blank" className="text-indigo-600 hover:underline text-xs">View Resume</a>
                    )}
                  </div>

                  <Badge className={
                      app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'screening' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                      app.status === 'offer' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                  }>
                    {app.status.toUpperCase()}
                  </Badge>
                  
                  <Link href={`/my-applications/${app.id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No applications yet</h3>
            <p className="text-muted-foreground mb-6">Start applying to jobs to see them here.</p>
            <Link href="/find-jobs">
                <Button className="bg-indigo-600">Find Jobs</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
