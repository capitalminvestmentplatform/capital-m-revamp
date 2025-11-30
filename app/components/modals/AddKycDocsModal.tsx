"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Users {
  _id: string;
  clientCode: string;
  firstName: string;
  role: string;
}

interface AddKycDocsModalProps {
  users: Users[];
  role: boolean;
  onSubmit: (data: any) => Promise<boolean>;
}

// Zod schema
const schema = (isAdmin: boolean) =>
  z.object({
    userId: isAdmin
      ? z.string().min(1, "User is required")
      : z.string().optional(),
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

export const AddKycDocsModal = ({
  users,
  role,
  onSubmit,
}: AddKycDocsModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(schema(role)),
    defaultValues: {},
  });

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    const success = await onSubmit(data);
    if (success) {
      reset();
      setSelectedUserId(null);
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton
          classes="bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md"
          name="Upload KYC"
          type="button"
        />
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload KYC Documents</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* User Select */}

          {role && (
            <div>
              <Label>User</Label>
              <Select
                onValueChange={(val) => {
                  setValue("userId", val);
                  setSelectedUserId(val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.clientCode} {user.firstName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.userId.message}
                </p>
              )}
            </div>
          )}

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
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              className="bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Submit Documents"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
