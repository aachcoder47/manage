// src/components/dashboard/interview/interviewCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Copy, ArrowUpRight, CopyCheck } from 'lucide-react';
import axios from 'axios';
import MiniLoader from '@/components/loaders/mini-loader/miniLoader';
import { ResponseService } from '@/services/responses.service';
import { InterviewerService } from '@/services/interviewers.service';

interface Props {
  name: string | null;
  // bigint values cannot be serialized between server and client safely.
  // Use string | number for client components. If your parent passes bigint,
  // convert it to string or number before passing.
  interviewerId?: string | number | null;
  id: string;
  url: string;
  readableSlug?: string | null;
}

const base_url = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_LIVE_URL : process.env.NEXT_PUBLIC_LIVE_URL;

export default function InterviewCard({
  name,
  interviewerId,
  id,
  url,
  readableSlug,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState<string>('');

  // fetch interviewer image (defensive)
  useEffect(() => {
    let mounted = true;
    const fetchInterviewer = async () => {
      if (interviewerId === undefined || interviewerId === null) return;
      try {
        const interviewer = await InterviewerService.getInterviewer(interviewerId as any);
        // make sure interviewer and interviewer.image exist
        if (mounted && interviewer && typeof interviewer.image === 'string') {
          setImg(interviewer.image);
        }
      } catch (err) {
        console.error('InterviewCard: failed to fetch interviewer', err);
      }
    };
    fetchInterviewer();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewerId]);

  // fetch responses and trigger analysis calls when needed (defensive)
  useEffect(() => {
    let mounted = true;

    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        if (!mounted) return;

        if (Array.isArray(responses)) {
          setResponseCount(responses.length);
          if (responses.length > 0) {
            setIsFetching(true);
            // iterate responses but don't let one failure crash UI
            for (const response of responses) {
              try {
                if (!response?.is_analysed) {
                  const result = await axios.post('/api/get-call', {
                    id: response.call_id,
                  });
                  if (result?.status !== 200) {
                    console.warn(`get-call returned status ${result?.status} for call ${response.call_id}`);
                  }
                }
              } catch (err) {
                console.error(`Failed to call /api/get-call for response ${response?.call_id}`, err);
              }
            }
            if (mounted) setIsFetching(false);
          }
        } else {
          // response is not array
          setResponseCount(0);
        }
      } catch (err) {
        console.error('InterviewCard: failed to fetch responses', err);
        if (mounted) {
          setResponseCount(0);
          setIsFetching(false);
        }
      }
    };

    fetchResponses();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const copyToClipboard = async () => {
    try {
      const link = readableSlug ? `${base_url}/call/${readableSlug}` : url;
      if (!link) {
        toast.error('No interview link available to copy.');
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = link;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      setCopied(true);
      toast.success('The link to your interview has been copied to your clipboard.', {
        position: 'bottom-right',
        duration: 3000,
      });

      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('InterviewCard: failed to copy link', err);
      toast.error('Failed to copy interview link.');
    }
  };

  const handleJumpToInterview = (event: React.MouseEvent) => {
    // prevent anchor navigation
    event.stopPropagation();
    event.preventDefault();

    try {
      const interviewUrl = readableSlug ? `/call/${readableSlug}` : `/call/${url}`;
      // open in new tab/window
      if (typeof window !== 'undefined') {
        window.open(interviewUrl, '_blank', 'noopener,noreferrer');
      } else {
        console.warn('window is undefined, cannot open interview URL');
      }
    } catch (err) {
      console.error('InterviewCard: failed to open interview', err);
      toast.error('Failed to open interview.');
    }
  };

  // placeholder avatar if image missing
  const AvatarPlaceholder = () => (
    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" />
        <path d="M4 20c0-3.314 4.03-6 8-6s8 2.686 8 6v1H4v-1z" fill="currentColor" />
      </svg>
    </div>
  );

  return (
    <a
      href={`/interviews/${id}`}
      style={{
        pointerEvents: isFetching ? 'none' : 'auto',
        cursor: isFetching ? 'default' : 'pointer',
      }}
      aria-disabled={isFetching}
    >
      <Card className="relative p-0 mt-4 inline-block cursor-pointer h-60 w-56 ml-1 mr-3 rounded-xl shrink-0 overflow-hidden shadow-md">
        <CardContent className={`p-0 ${isFetching ? 'opacity-60' : ''}`}>
          <div className="w-full h-40 overflow-hidden bg-indigo-600 flex items-center text-center">
            <CardTitle className="w-full mt-3 mx-2 text-white text-lg">
              {name ?? 'Untitled Interview'}
              {isFetching && (
                <div className="z-100 mt-[-5px]">
                  <MiniLoader />
                </div>
              )}
            </CardTitle>
          </div>

          <div className="flex flex-row items-center mx-4 py-3 gap-4">
            <div className="w-16 h-16 overflow-hidden rounded-full">
              {img ? (
                // Render Image only when src is available to avoid Next/Image runtime errors
                <Image
                  src={img}
                  alt="Picture of the interviewer"
                  width={70}
                  height={70}
                  className="object-cover object-center rounded-full"
                />
              ) : (
                <AvatarPlaceholder />
              )}
            </div>

            <div className="text-black text-sm font-semibold mt-2 mr-2 whitespace-nowrap">
              Responses:{' '}
              <span className="font-normal">{responseCount !== null ? responseCount : 0}</span>
            </div>
          </div>

          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              className="text-xs text-indigo-600 px-1 h-6"
              variant="secondary"
              onClick={handleJumpToInterview}
              aria-label="Open interview in new tab"
              title="Open interview"
            >
              <ArrowUpRight size={16} />
            </Button>

            <Button
              className={`text-xs text-indigo-600 px-1 h-6 ${copied ? 'bg-indigo-300 text-white' : ''}`}
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                copyToClipboard();
              }}
              aria-label="Copy interview link"
              title="Copy interview link"
            >
              {copied ? <CopyCheck size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
