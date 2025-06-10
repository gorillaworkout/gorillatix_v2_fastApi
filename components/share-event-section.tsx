"use client";

import { FacebookIcon, TwitterIcon, LinkedinIcon, MailIcon, Instagram  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface ShareEventSectionProps {
  title: string;
  slug: string;
  imageUrl: string;
  date: string;
  description?: string;
}

export const ShareEventSection = ({
  title,
  date,
}: ShareEventSectionProps) => {
  const pathname = usePathname();
  const url = `https://www.gorillatix.com${pathname}`; // update to your production domain

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${title} - ${date}`
  )}&url=${encodeURIComponent(url)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url
  )}`;
  const instagramLink = `https://www.instagram.com/gorillaworkout/`; // replace with your real IG profile

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Share This Event</h3>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => window.open(facebookShareUrl, "_blank")}
        >
          <FacebookIcon className="w-4 h-4" />
          <span className="sr-only">Share on Facebook</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => window.open(twitterShareUrl, "_blank")}
        >
          <TwitterIcon className="w-4 h-4" />
          <span className="sr-only">Share on Twitter</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => window.open(linkedinShareUrl, "_blank")}
        >
          <LinkedinIcon className="w-4 h-4" />
          <span className="sr-only">Share on LinkedIn</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => window.open(instagramLink, "_blank")}
        >
          <Instagram className="w-4 h-4" />
          <span className="sr-only">Share via Instagram</span>
        </Button>
      </div>
    </div>
  );
};
