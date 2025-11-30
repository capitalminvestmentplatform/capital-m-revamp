// === imports (keep with your other imports) ===
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ---- Types
type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  clientCode?: string;
  email?: string;
  role?: string;
};
type Asset = {
  _id: string;
  assetName: string;
  category: string; // ObjectId (string)
  subCategory: string; // ObjectId (string)
};

// ---- Zod schema (all required)
const RequiredFormSchema = z.object({
  userId: z.string().min(1, "Select a user"),
  asset: z.object(
    {
      _id: z.string(),
      assetName: z.string(),
      category: z.string(),
      subCategory: z.string(),
    },
    { required_error: "Select an asset" }
  ),
  marketValue: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .positive("Must be > 0"),
  costPrice: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .positive("Must be > 0"),
  initialCost: z.coerce
    .number({ invalid_type_error: "Enter a valid number" })
    .positive("Must be > 0"),
});

type RightFormValues = z.infer<typeof RequiredFormSchema>;

// ---- Searchable Asset Combobox
function AssetCombobox({
  value,
  onChange,
  assets,
}: {
  value: Asset | undefined;
  onChange: (asset: Asset) => void;
  assets: Asset[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {value ? value.assetName : "Select asset"}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search asset..." />
          <CommandEmpty>No asset found.</CommandEmpty>
          <CommandGroup>
            {assets.map((a) => (
              <CommandItem
                key={a._id}
                value={a.assetName}
                onSelect={() => {
                  onChange(a); // 👉 send whole object
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value?._id === a._id ? "opacity-100" : "opacity-0"
                  )}
                />
                {a.assetName}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ---- Right-side independent form (ALL fields visible & required)
export function AddUserAssetForm({
  users,
  assets,
}: {
  users: User[];
  assets: Asset[];
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm<RightFormValues>({
    resolver: zodResolver(RequiredFormSchema),
    defaultValues: {
      userId: "",
      marketValue: undefined as unknown as number, // will be coerced
      costPrice: undefined as unknown as number, // will be coerced
      initialCost: undefined as unknown as number, // will be coerced
    },
    mode: "onSubmit", // change to "onChange" if you want live validation
  });

  const onSubmit = async (data: RightFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/malco/admin-investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: data.userId,
          categoryId: data.asset.category,
          subCategoryId: data.asset.subCategory,
          userAsset: data.asset.assetName,
          costPrice: data.costPrice,
          marketValue: data.marketValue,
          initialCost: data.initialCost,
        }),
      });

      const response = await res.json();

      if (response.statusCode !== 201) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);
      form.reset(); // Reset form on success
    } catch (error: any) {
      // toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-xl"
      >
        <div className="grid grid-cols-2 gap-5">
          {/* User */}
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users
                      .filter((u) => u.role !== "Admin")
                      .map((u) => (
                        <SelectItem key={u._id} value={u._id}>
                          {u.clientCode} - {u.firstName} {u.lastName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Asset (searchable) */}
          <FormField
            control={form.control}
            name="asset"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asset</FormLabel>
                <FormControl>
                  <AssetCombobox
                    value={field.value}
                    onChange={field.onChange}
                    assets={assets}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Market Value */}
          <FormField
            control={form.control}
            name="marketValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Market Value (AED)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g., 100000"
                    value={(field.value as unknown as string) ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cost Price */}
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price (AED)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g., 95000"
                    value={(field.value as unknown as string) ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Initial Cost */}
          <FormField
            control={form.control}
            name="initialCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Cost (AED)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g., 90000"
                    value={(field.value as unknown as string) ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-primaryBG hover:bg-primaryBG"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default AddUserAssetForm;
