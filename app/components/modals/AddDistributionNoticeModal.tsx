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
import { Textarea } from "@/components/ui/textarea";
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

interface Commitments {
  _id: string;
  title: string;
  userId: string;
  status: string;
}

interface Users {
  _id: string;
  clientCode: string;
  firstName: string;
  role: string;
}

interface AddDistributionNoticeModalProps {
  users: Users[];
  commitments?: Commitments[];
  onSubmit: (data: any) => Promise<boolean>;
}

// Zod schema
const getDistributionNoticeSchema = () =>
  z.object({
    userId: z.string().min(1, "User is required"),
    commitmentName: z.string().min(1, "User is required"),
    distributionAmount: z
      .string()
      .min(1, "Amount is required")
      .regex(/^\d+$/, "Amount must be numeric"),
    distributionDate: z.string().min(1, "Date is required"),
    description: z.string().optional(),
    pdf: z
      .any()
      .refine(
        (fileList) =>
          fileList && fileList.length > 0 && fileList[0] instanceof File,
        "PDF is required"
      ),
  });

export const AddDistributionNoticeModal = ({
  users,
  commitments,
  onSubmit,
}: AddDistributionNoticeModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(getDistributionNoticeSchema()),
    defaultValues: {},
  });

  const handleFormSubmit = async (data: any) => {
    setLoading(true);

    const success = await onSubmit(data); // send plain object
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
          classes={`bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md`}
          name="Add Distribution Notice"
          type="button"
        />
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Distribution Notice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Users dropdown - Only for Admins and if not preselected */}
          <div>
            <Label>Users</Label>
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
                {users
                  ?.filter((user) => user.role !== "Admin")
                  .map((user) => (
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

          <div>
            <Label>Investment Name</Label>
            <Select onValueChange={(val) => setValue("commitmentName", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Commitment" />
              </SelectTrigger>
              <SelectContent>
                {commitments
                  ?.filter(
                    (com) =>
                      com.userId === selectedUserId &&
                      com.status === "Completed"
                  )
                  .map((com) => (
                    <SelectItem key={com._id} value={com.title}>
                      {com.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.commitmentName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.commitmentName.message}
              </p>
            )}
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

          {/* Amount Input */}
          <div>
            <Label>Distribution Amount</Label>
            <Input
              placeholder="Enter distribution amount"
              {...register("distributionAmount")}
            />
            {errors.distributionAmount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.distributionAmount.message}
              </p>
            )}
          </div>

          {/* Message Textarea */}
          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="Description"
              {...register("description")}
            />
          </div>

          {/* PDF Upload */}
          <div>
            <Label>Attach PDF</Label>
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
              {loading ? "Adding..." : "Add Distribution Notice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
