"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CustomButton from "../Button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface Users {
  _id: string;
  clientCode: string;
  firstName: string;
  role: string;
  email: string;
  phone: string;
}

interface AddReceiptModalProps {
  users: Users[];
  onSubmit: (data: any) => Promise<boolean>;
}

const rowSchema = z.object({
  userId: z.string().min(1, "User is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  username: z.string().min(1, "Username is required"),
  clientCode: z.string().min(1, "Client code is required"),
  commitmentAmount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !Number.isNaN(Number(v)), "Amount must be a number")
    .refine((v) => Number(v) > 0, "Amount must be greater than 0"),
  createdAt: z.string().min(1, "Receipt date is required"),
});

const formSchema = z.object({
  rows: z.array(rowSchema).min(1, "Please select at least one user"),
});

type FormValues = z.infer<typeof formSchema>;

export const AddReceiptModal = ({ users, onSubmit }: AddReceiptModalProps) => {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const nonAdminUsers = useMemo(
    () => users?.filter((u) => u.role !== "Admin") ?? [],
    [users]
  );

  const userMap = useMemo(() => {
    const map = new Map<string, Users>();
    nonAdminUsers.forEach((u) => map.set(u._id, u));
    return map;
  }, [nonAdminUsers]);

  const defaultDate = () => new Date().toISOString().slice(0, 10);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { rows: [] },
    mode: "onChange",
  });

  const { control, handleSubmit, reset, formState } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
    keyName: "keyId",
  });

  const findRowIndex = (userId: string) =>
    form.getValues("rows").findIndex((r) => r.userId === userId);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const isSelected = prev.includes(userId);

      if (isSelected) {
        const idx = findRowIndex(userId);
        if (idx !== -1) remove(idx);
        return prev.filter((id) => id !== userId);
      }

      const u = userMap.get(userId);
      if (!u) return prev;

      const idx = findRowIndex(userId);
      if (idx === -1) {
        append({
          userId: u._id,
          username: u.firstName,
          clientCode: u.clientCode,
          email: u.email,
          phone: u.phone,
          commitmentAmount: "",
          createdAt: defaultDate(),
        });
      }

      return [...prev, userId];
    });
  };

  useEffect(() => {
    if (!open) {
      setSelectedUserIds([]);
      reset({ rows: [] });
    }
  }, [open, reset]);

  const onValidSubmit = async (values: FormValues) => {
    const payload = {
      userIds: selectedUserIds,
      rows: values.rows,
    };
    const ok = await onSubmit(payload.rows);
    if (ok) {
      setOpen(false);
      setSelectedUserIds([]);
      reset({ rows: [] });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUserIds([]);
    reset({ rows: [] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton
          classes="bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md"
          name="Add Receipt (Bulk)"
          type="button"
        />
      </DialogTrigger>

      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Create New Receipt</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-4">
            {/* Multi-select dropdown */}
            <div className="space-y-2">
              <Label>Select Users to Distribute</Label>

              <Popover open={pickerOpen} onOpenChange={setPickerOpen} modal>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedUserIds.length > 0
                      ? `${selectedUserIds.length} user(s) selected`
                      : "Select users"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandInput placeholder="Search user..." />
                    <CommandEmpty>No user found.</CommandEmpty>

                    <div className="max-h-64 overflow-y-auto">
                      <CommandGroup>
                        {nonAdminUsers.map((u) => {
                          const checked = selectedUserIds.includes(u._id);

                          return (
                            <CommandItem
                              key={u._id}
                              value={u._id}
                              onSelect={() => toggleUser(u._id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  checked ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {u.clientCode} - {u.firstName}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </div>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected chips */}
              {selectedUserIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUserIds.map((id) => {
                    const u = userMap.get(id);
                    if (!u) return null;

                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 rounded-md border px-3 py-1 text-sm"
                      >
                        <span>
                          {u.clientCode} - {u.firstName}
                        </span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => toggleUser(id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Top-level error (min rows) */}
              {typeof formState.errors.rows?.message === "string" && (
                <p className="text-sm text-red-500">
                  {formState.errors.rows?.message}
                </p>
              )}
            </div>

            {/* Scrollable Table */}
            <div className="rounded-md border">
              <div className="max-h-[320px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="text-black">Username</TableHead>
                      <TableHead className="text-black">Client Code</TableHead>
                      <TableHead className="w-[170px] text-black">
                        Commitment Amount (AED)
                      </TableHead>
                      <TableHead className="w-[190px] text-black">
                        Receipt Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {fields.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-sm text-muted-foreground"
                        >
                          No user selected
                        </TableCell>
                      </TableRow>
                    ) : (
                      fields.map((field, index) => (
                        <TableRow key={field.keyId}>
                          <TableCell>{field.username}</TableCell>
                          <TableCell>{field.clientCode}</TableCell>

                          {/* Amount */}
                          <TableCell className="align-top">
                            <FormField
                              control={control}
                              name={`rows.${index}.commitmentAmount`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="0" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="align-top">
                            <FormField
                              control={control}
                              name={`rows.${index}.createdAt`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>

                          {/* Date */}

                          {/* Description */}

                          {/* Hidden fields (still part of schema) */}
                          <input
                            type="hidden"
                            {...form.register(`rows.${index}.userId`)}
                            value={field.userId}
                          />
                          <input
                            type="hidden"
                            {...form.register(`rows.${index}.username`)}
                            value={field.username}
                          />
                          <input
                            type="hidden"
                            {...form.register(`rows.${index}.clientCode`)}
                            value={field.clientCode}
                          />
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="bg-primaryBG hover:bg-primaryBG text-white"
                type="submit"
                disabled={fields.length === 0 || formState.isSubmitting}
              >
                {formState.isSubmitting ? "Submitting..." : "Submit Receipts"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
