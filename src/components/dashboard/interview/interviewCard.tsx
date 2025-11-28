import { useEffect, useState, MouseEvent } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Copy, ArrowUpRight, CopyCheck } from "lucide-react";
import axios from "axios";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { ResponseService } from "@/services/responses.service";
import { InterviewerService } from "@/services/interviewers.service";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

export default function InterviewCard(props: Props) {
  const { name, interviewerId, id, url, readableSlug } = props;

  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState("");

  // Load interviewer image
  useEffect(() => {
    async function fetchInterviewer() {
      const interviewer = await InterviewerService.getInterviewer(interviewerId);
      setImg(interviewer.image);
    }

    fetchInterviewer();
  }, [interviewerId]);

  // Load responses
  useEffect(() => {
    async function fetchResponses() {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);

        if (responses.length > 0) {
          setIsFetching(true);

          for (const response of responses) {
            if (!response.is_analysed) {
              try {
                const result = await axios.post("/api/get-call", {
                  id: response.call_id,
                });

                if (result.status !== 200) {
                  throw new Error(`HTTP error! status: ${result.status}`);
                }
              } catch (err) {
                console.error("Failed get-call:", err);
              }
            }
          }

          setIsFetching(false);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchResponses();
  }, [id]);

  // Copy link
  function copyToClipboard() {
    const link = readableSlug
      ? `${base_url}/call/${readableSlug}`
      : `${base_url}/call/${url}`;

    navigator.clipboard.writeText(link).then(
      () => {
        setCopied(true);

        toast.success("Link copied to clipboard.", {
          position: "bottom-right",
          duration: 3000,
        });

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      (err) => {
        console.error("Failed to copy:", err);
      },
    );
  }

  // Jump to interview
  function handleJumpToInterview(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const interviewUrl = readableSlug ? `/call/${readableSlug}` : `/call/${url}`;

    window.open(interviewUrl, "_blank");
  }

  return (
    <a
      href={`/interviews/${id}`}
      style={{
        pointerEvents: isFetching ? "none" : "auto",
        cursor: isFetching ? "default" : "pointer",
      }}
    >
      <Card className="relative mt-4 ml-1 mr-3 inline-block h-60 w-56 shrink-0 cursor-pointer overflow-hidden rounded-xl p-0 shadow-md">
        <CardContent className={`p-0 ${isFetching ? "opacity-60" : ""}`}>
          <div className="flex h-40 w-full items-center overflow-hidden bg-indigo-600 text-center">
            <CardTitle className="mx-2 mt-3 w-full text-lg text-white">
              {name}
              {isFetching ? (
                <div className="z-100 -mt-1">
                  <MiniLoader />
                </div>
              ) : null}
            </CardTitle>
          </div>

          <div className="mx-4 flex flex-row items-center">
            <div className="w-full overflow-hidden">
              <Image
                alt="Interviewer"
                className="object-cover object-center"
                height={70}
                src={img}
                width={70}
              />
            </div>

            <div className="mt-2 mr-2 whitespace-nowrap text-sm font-semibold text-black">
              Responses: <span className="font-normal">{responseCount || 0}</span>
            </div>
          </div>

          <div className="absolute right-2 top-2 flex gap-1">
            <Button
              className="h-6 px-1 text-xs text-indigo-600"
              onClick={handleJumpToInterview}
              variant="secondary"
            >
              <ArrowUpRight size={16} />
            </Button>

            <Button
              className={`h-6 px-1 text-xs text-indigo-600 ${
                copied ? "bg-indigo-300 text-white" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                copyToClipboard();
              }}
              variant="secondary"
            >
              {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
