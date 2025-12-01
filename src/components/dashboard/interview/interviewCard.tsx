import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight, Brain, Filter, BarChart3 } from "lucide-react";
import { CopyCheck } from "lucide-react";
import { ResponseService } from "@/services/responses.service";
import axios from "axios";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { InterviewerService } from "@/services/interviewers.service";
import { useRouter } from "next/navigation";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
}
            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
<<<<<<< HEAD
              <Button
                variant="outline"
                className="h-8 text-xs flex items-center justify-center gap-1.5 border-primary/10 hover:bg-primary/5 hover:text-primary transition-colors"
                title="Create Skill Assessment"
                onClick={handleCreateAssessment}
              >
                <Brain className="h-3.5 w-3.5" />
                Assess
              </Button>
              
              <Button
                variant="outline"
                className="h-8 text-xs flex items-center justify-center gap-1.5 border-primary/10 hover:bg-primary/5 hover:text-primary transition-colors"
                title="Filter Candidates"
                disabled={responseCount === 0}
                onClick={handleFilterCandidates}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
              
              <Button
                variant="outline"
                className="h-8 text-xs flex items-center justify-center gap-1.5 border-primary/10 hover:bg-primary/5 hover:text-primary transition-colors"
                title="View Analytics"
                disabled={responseCount === 0}
                onClick={handleViewAnalytics}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics
=======
              <Button variant="outline" className="h-8 text-xs flex items-center justify-center gap-1.5" onClick={handleCreateAssessment} title="Create Skill Assessment">
                <Brain className="h-3.5 w-3.5" /> Assess
              </Button>
              <Button variant="outline" className="h-8 text-xs flex items-center justify-center gap-1.5" onClick={handleFilterCandidates} title="Filter Candidates" disabled={responseCount === 0}>
                <Filter className="h-3.5 w-3.5" /> Filter
              </Button>
              <Button variant="outline" className="h-8 text-xs flex items-center justify-center gap-1.5" onClick={handleViewAnalytics} title="View Analytics" disabled={responseCount === 0}>
                <BarChart3 className="h-3.5 w-3.5" /> Analytics
>>>>>>> 253843eb5ba395ac7e489e763c652be21a4c536d
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
                    }
