"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface PreviewSignProps {
  url: string;
}

const PreviewSign: React.FC<PreviewSignProps> = ({ url }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-xs bg-green-200 hover:bg-green-200 text-green-600 hover:text-green-600 px-3 py-1 h-6 rounded-md font-normal"
        >
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm font-medium">Signature Preview</p>
          <img
            src={url}
            alt="Signature"
            width={300}
            height={150}
            className="rounded border object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewSign;
