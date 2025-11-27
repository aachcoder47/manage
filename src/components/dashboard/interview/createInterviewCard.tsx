"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function CreateInterviewCard() {
  const [open, setOpen] = useState(false);
  const { organization } = useOrganization();
  const router = useRouter();

  const handleClick = async () => {
    if (!organization) {
      toast.error("Please create an organization first");
      return;
    }

    try {
      // Check if user can create more interviews
      const { SubscriptionService } = await import('@/services/subscription.service');
      const canCreate = await SubscriptionService.canCreateInterview(organization.id);
      
      if (!canCreate) {
        toast.error("You've reached your interview limit. Please upgrade to create more interviews.", {
          duration: 4000,
          action: {
            label: "View Plans",
            onClick: () => router.push('/pricing'),
          },
        });
        return;
      }

      // If can create, open the modal
      setOpen(true);
    } catch (error) {
      console.error("Error checking interview limit:", error);
      toast.error("Failed to check interview limit");
    }
  };

  return (
    <>
      <Card
        className="group relative flex items-center justify-center border-dashed border-2 border-muted-foreground/25 bg-muted/5 hover:bg-muted/10 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg h-72 w-full rounded-xl overflow-hidden"
        onClick={handleClick}
      >
        <CardContent className="flex items-center flex-col mx-auto p-6 transition-transform duration-300 group-hover:scale-105">
          <div className="flex flex-col justify-center items-center w-16 h-16 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors mb-4">
            <Plus size={32} className="text-primary/70 group-hover:text-primary transition-colors" />
          </div>
          <CardTitle className="text-lg font-medium text-center text-muted-foreground group-hover:text-foreground transition-colors">
            Create New Interview
          </CardTitle>
          <p className="text-xs text-muted-foreground/70 text-center mt-2 max-w-[150px]">
            Set up a new AI-conducted interview in seconds
          </p>
        </CardContent>
      </Card>
      <Modal
        open={open}
        closeOnOutsideClick={false}
        onClose={() => {
          setOpen(false);
        }}
      >
        <CreateInterviewModal open={open} setOpen={setOpen} />
      </Modal>
    </>
  );
}

export default CreateInterviewCard;
