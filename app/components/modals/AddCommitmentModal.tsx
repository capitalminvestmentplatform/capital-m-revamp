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
import { getLoggedInUser } from "@/utils/client";

interface Investments {
  _id: string;
  title: string;
  productId: string;
}

interface Users {
  _id: string;
  clientCode: string;
  firstName: string;
  role: string;
}

interface AddCommitmentModalProps {
  users: Users[];
  investments?: Investments[];
  onSubmit: (data: any) => Promise<boolean>;
  context?: "commitments" | "product-details";
  selectedProductId?: string;
  selectedUserId?: string;
}

// Zod schema
const getCommitmentSchema = (isAdmin: boolean) =>
  z.object({
    userId: isAdmin
      ? z.string().min(1, "User is required")
      : z.string().optional(),
    pId: z.string().min(1, "Product is required"),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^\d+$/, "Phone must be numeric"),
    commitmentAmount: z
      .string()
      .min(1, "Amount is required")
      .regex(/^\d+$/, "Amount must be numeric"),
    message: z.string().optional(),
  });

export const AddCommitmentModal = ({
  users,
  investments,
  onSubmit,
  selectedProductId,
  selectedUserId,
  context,
}: AddCommitmentModalProps) => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = role === "Admin"; // or however you determine the role

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(getCommitmentSchema(isAdmin)),
    defaultValues: {
      userId: selectedUserId || "",
      pId: selectedProductId || "",
    },
  });

  useEffect(() => {
    if (context === "product-details") {
      if (selectedProductId) setValue("pId", selectedProductId);
      if (selectedUserId && !isAdmin) setValue("userId", selectedUserId);
    }
  }, [context, selectedProductId, selectedUserId, isAdmin, setValue]);

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    const success = await onSubmit(data);
    if (success) {
      reset();
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton
          classes={`bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md ${context === "product-details" && "w-full"}`}
          name="Add Commitment"
          type="button"
        />
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Commitment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Users dropdown - Only for Admins and if not preselected */}
          {isAdmin && (!selectedUserId || context !== "product-details") && (
            <div>
              <Label>Users</Label>
              <Select onValueChange={(val) => setValue("userId", val)}>
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
          )}

          {/* Investments dropdown - Only if not coming from product-details */}
          {context !== "product-details" && (
            <div>
              <Label>Investment</Label>
              <Select onValueChange={(val) => setValue("pId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select investment" />
                </SelectTrigger>
                <SelectContent>
                  {investments?.map((inv) => (
                    <SelectItem key={inv._id} value={inv._id}>
                      {inv.productId} {inv.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.pId.message}
                </p>
              )}
            </div>
          )}

          {/* Phone Input */}
          <div>
            <Label>Phone Number</Label>
            <Input placeholder="Enter phone number" {...register("phone")} />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <Label>Commitment Amount</Label>
            <Input
              placeholder="Enter commitment amount"
              {...register("commitmentAmount")}
            />
            {errors.commitmentAmount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.commitmentAmount.message}
              </p>
            )}
          </div>

          {/* Message Textarea */}
          <div>
            <Label>Message</Label>
            <Textarea
              rows={3}
              placeholder="Optional message"
              {...register("message")}
            />
          </div>

          <div className="pt-2">
            <Button
              className="bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Commitment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
