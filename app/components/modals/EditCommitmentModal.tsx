"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Pencil } from "lucide-react";
import CustomButton from "../Button";

const getCommitmentSchema = z.object({
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

export const EditCommitmentModal = ({
  defaultValues,
  onUpdate,
}: {
  defaultValues: any;
  onUpdate: (data: any) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(getCommitmentSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    const success = await onUpdate({ ...data, _id: defaultValues._id });
    if (success) {
      toast.success("Commitment updated.");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Commitment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Phone</Label>
            <Input {...register("phone")} />
            {errors.phone && (
              <p className="text-red-500">{errors.phone.message as string}</p>
            )}
          </div>
          <div>
            <Label>Amount</Label>
            <Input {...register("commitmentAmount")} />
            {errors.commitmentAmount && (
              <p className="text-red-500">
                {errors.commitmentAmount.message as string}
              </p>
            )}
          </div>
          <div>
            <Label>Message</Label>
            <Textarea {...register("message")} />
          </div>
          <CustomButton
            classes="bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md w-full"
            name="Update Commitment"
            type="submit"
            state={loading}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
