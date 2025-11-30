"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import CustomButton from "../Button";
import { Pencil } from "lucide-react";

interface EditDistributionNoticeModalProps {
  distribution: {
    _id: string;
    username: string;
    userId: string;
    commitmentName: string;
    distributionAmount: string;
    distributionDate: string;
    description?: string;
    pdf?: string;
  };
  onSubmit: (id: string, data: any) => Promise<boolean>;
}

const editDistributionSchema = z.object({
  distributionAmount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+$/, "Amount must be numeric"),
  distributionDate: z.string().min(1, "Date is required"),
  description: z.string().optional(),
  pdf: z
    .any()
    .optional()
    .refine(
      (fileList) =>
        !fileList || fileList.length === 0 || fileList[0] instanceof File,
      "Invalid file"
    ),
});

export const EditDistributionNoticeModal = ({
  distribution,
  onSubmit,
}: EditDistributionNoticeModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(editDistributionSchema),
    defaultValues: {
      distributionAmount: distribution.distributionAmount,
      distributionDate: distribution.distributionDate,
      description: distribution.description || "",
      pdf: undefined,
    },
  });

  const handleFormSubmit = async (data: any) => {
    setLoading(true);

    const success = await onSubmit(distribution._id, data);
    if (success) {
      reset();
      setOpen(false);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-white/80 p-1 rounded hover:bg-green-200">
          <Pencil size={16} className="text-primaryBG" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Distribution Notice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label>User</Label>
            <Input value={distribution.username} disabled />
          </div>

          <div>
            <Label>Commitment</Label>
            <Input value={distribution.commitmentName} disabled />
          </div>

          <div>
            <Label>Distribution Date</Label>
            <Input type="date" {...register("distributionDate")} />
            {errors.distributionDate && (
              <p className="text-red-500 text-sm mt-1">
                {errors.distributionDate.message}
              </p>
            )}
          </div>

          <div>
            <Label>Distribution Amount</Label>
            <Input {...register("distributionAmount")} />
            {errors.distributionAmount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.distributionAmount.message}
              </p>
            )}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>

          <div>
            <Label>Replace PDF (optional)</Label>

            {/* View current PDF */}
            {distribution.pdf && (
              <div className="flex items-center justify-between mb-2">
                <a
                  href={distribution.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm underline hover:text-blue-800"
                >
                  View Current PDF
                </a>
              </div>
            )}

            {/* Upload new one */}
            <Input type="file" accept="application/pdf" {...register("pdf")} />
            {errors.pdf && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pdf.message as string}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              className="bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
