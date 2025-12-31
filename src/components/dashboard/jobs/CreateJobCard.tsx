import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function CreateJobCard() {
  return (
    <div className="space-y-4">
      {/* Primary Card */}
      <Link href="/jobs/new">
        <Card className="hover:shadow-lg transition-all duration-300 h-72 w-full rounded-xl overflow-hidden border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 cursor-pointer group relative">
          <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="p-4 bg-indigo-100 rounded-full group-hover:bg-indigo-200 group-hover:scale-110 transition-all duration-300">
              <Plus className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg text-foreground">Post a Job</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new job listing
              </p>
            </div>
            <div className="absolute top-2 right-2">
              <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Fallback Button */}
      <div className="text-center">
        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          <Link href="/jobs/new">
            <Plus className="w-4 h-4 mr-2" />
            Post a New Job
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default CreateJobCard;
