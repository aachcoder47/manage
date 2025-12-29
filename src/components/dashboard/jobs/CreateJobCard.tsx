import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

function CreateJobCard() {
  return (
    <Link href="/jobs/new">
      <Card className="hover:shadow-lg transition-all duration-300 h-72 w-full rounded-xl overflow-hidden border-dashed border-2 bg-muted/20 hover:bg-muted/40 cursor-pointer group">
        <CardContent className="flex flex-col items-center justify-center h-full space-y-4">
          <div className="p-4 bg-indigo-50 rounded-full group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300">
            <Plus className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg text-foreground">Post a Job</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new job listing
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default CreateJobCard;
