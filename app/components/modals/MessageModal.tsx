"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CustomButton from "../Button";

const MessageModal = ({ message }: { message: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton
          classes="text-xs px-2 py-1 h-7 bg-primaryBG hover:bg-primaryBG text-white rounded-md font-normal"
          name="View"
          type="button"
        />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {message}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageModal;
