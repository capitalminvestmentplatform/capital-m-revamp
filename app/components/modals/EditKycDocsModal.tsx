"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomButton from "../Button";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Pencil } from "lucide-react";

interface KycData {
  _id: string;
  nationalId?: string;
  nationalPassport?: string;
  residenceProof?: string;
}

interface EditKycDocsModalProps {
  kycData: KycData;
  onSubmit: (data: any) => Promise<boolean>;
}

const schema = z.object({
  nationalId: z
    .any()
    .optional()
    .refine(
      (f) => !f || f.length === 0 || f[0] instanceof File,
      "Invalid file"
    ),
  nationalPassport: z
    .any()
    .optional()
    .refine(
      (f) => !f || f.length === 0 || f[0] instanceof File,
      "Invalid file"
    ),
  residenceProof: z
    .any()
    .optional()
    .refine(
      (f) => !f || f.length === 0 || f[0] instanceof File,
      "Invalid file"
    ),
});

export const EditKycDocsModal = ({
  kycData,
  onSubmit,
}: EditKycDocsModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    const success = await onSubmit({ ...data, id: kycData._id });
    if (success) {
      reset();
      setOpen(false);
    }
    setLoading(false);
  };

  const renderPreview = (label: string, url?: string) =>
    url ? (
      <div className="flex items-center justify-between mb-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 text-sm underline hover:text-blue-800"
        >
          View Current Document
        </a>
      </div>
    ) : (
      <div className="text-red-600 text-sm underline hover:text-red-800">
        Not uploaded
      </div>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-white/80 p-1 rounded hover:bg-green-200">
          <Pencil size={16} className="text-primaryBG" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit KYC Documents</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* National ID */}
          <div>
            <Label>National ID (PDF/Image)</Label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              {...register("nationalId")}
            />
            {errors.nationalId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nationalId.message as string}
              </p>
            )}
            {renderPreview("National ID", kycData.nationalId)}
          </div>

          {/* Passport */}
          <div>
            <Label>Passport (PDF/Image)</Label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              {...register("nationalPassport")}
            />
            {errors.nationalPassport && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nationalPassport.message as string}
              </p>
            )}
            {renderPreview("Passport", kycData.nationalPassport)}
          </div>

          {/* Residence Proof */}
          <div>
            <Label>Proof of Residence (PDF/Image)</Label>

            <Input
              type="file"
              accept="application/pdf,image/*"
              {...register("residenceProof")}
            />
            {errors.residenceProof && (
              <p className="text-red-500 text-sm mt-1">
                {errors.residenceProof.message as string}
              </p>
            )}
            {renderPreview("Proof", kycData.residenceProof)}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              className="bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Documents"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
