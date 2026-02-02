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

interface Users {
  _id: string;
  clientCode: string;
  firstName: string;
  role: string;
}

interface AddStatementModalProps {
  users: Users[];
  onSubmit: (data: any) => Promise<boolean>;
}

// Zod schema
const getStatementSchema = () =>
  z.object({
    userId: z.string().min(1, "User is required"),
    month: z.string().min(1, "Month is required"),
    year: z
      .string()
      .min(1, "Year is required")
      .regex(/^\d+$/, "Amount must be numeric"),
    pdf: z
      .any()
      .refine(
        (fileList) =>
          fileList && fileList.length > 0 && fileList[0] instanceof File,
        "PDF is required",
      ),
  });

export const AddStatementModal = ({
  users,
  onSubmit,
}: AddStatementModalProps) => {
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
    resolver: zodResolver(getStatementSchema()),
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

  const monthOptions = [
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" },
  ];
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton
          classes={`bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md`}
          name="Add Statement"
          type="button"
        />
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Statement</DialogTitle>
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
                  .sort((a, b) => a.clientCode.localeCompare(b.clientCode))
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
            <Label>Month</Label>
            <Select onValueChange={(val) => setValue("month", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.label}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.month && (
              <p className="text-red-500 text-sm mt-1">
                {errors.month.message}
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <Label>Year</Label>
            <Input placeholder="Enter year" {...register("year")} />
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
            )}
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
              {loading ? "Adding..." : "Add Statement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
