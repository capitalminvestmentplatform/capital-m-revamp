"use client";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn/ui
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
import AddUserAssetForm from "./AddUserAssetForm";
type Category = { _id: string; name: string };
type SubCategory = { _id: string; name: string; category: string }; // category = Category._id
type Asset = any;
type User = any;

const schema = z.object({
  category: z.string().min(1, "Select a category"),
  subCategory: z.string().min(1, "Select a sub category"),
  assetName: z.string().min(1, "Asset name is required"),
});

type FormValues = z.infer<typeof schema>;

const PandaConnectPage = () => {
  const [malcoCategoryList, setMalcoCategoryList] = useState<Category[]>([]);
  const [malcoSubCategoryList, setMalcoSubCategoryList] = useState<
    SubCategory[]
  >([]);
  const [malcoAssets, setMalcoAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMalcoCategories = async () => {
    try {
      const res = await fetch("/api/malco/categories");
      if (!res.ok) {
        throw new Error("Network res was not ok");
      }
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      const result = response.data;
      setMalcoCategoryList(result);
    } catch (error) {
      return (error as Error).message;
    }
  };
  const fetchMalcoSubCategories = async () => {
    try {
      const res = await fetch("/api/malco/sub-categories");
      if (!res.ok) {
        throw new Error("Network res was not ok");
      }
      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      const result = response.data;
      setMalcoSubCategoryList(result);
    } catch (error) {
      return (error as Error).message;
    }
  };
  const fetchMalcoAssets = async () => {
    try {
      const res = await fetch("/api/malco/malco-assets?type=admin");
      if (!res.ok) {
        throw new Error("Network res was not ok");
      }
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      const result = response.data;
      setMalcoAssets(result.filter((item: any) => item.byAdmin));
    } catch (error) {
      return (error as Error).message;
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users?all=true");
      if (!res.ok) {
        throw new Error("Network res was not ok");
      }
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      const result = response.data.users;
      setUsers(result);
    } catch (error) {
      return (error as Error).message;
    }
  };

  useEffect(() => {
    fetchMalcoCategories();
    fetchMalcoSubCategories();
    fetchMalcoAssets();
    fetchUsers();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "",
      subCategory: "",
      assetName: "",
    },
  });

  // watch selected category to drive dependent subcategory list
  const selectedCategoryId = form.watch("category");

  const filteredSubCategories = useMemo(
    () => malcoSubCategoryList.filter((s) => s.category === selectedCategoryId),
    [malcoSubCategoryList, selectedCategoryId]
  );

  // whenever category changes, clear subcategory
  useEffect(() => {
    form.setValue("subCategory", "");
  }, [selectedCategoryId, form]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/malco/malco-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, byAdmin: true }),
      });

      const response = await res.json();

      if (response.statusCode !== 201) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);
      fetchMalcoAssets();
      form.reset(); // Reset form on success
    } catch (error: any) {
      // toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-10 grid grid-cols-2 gap-10">
      {/* LEFT: Dependent form */}
      <div className="max-w-xl">
        <p className="font-semibold text-lg mb-10 text-center">
          Add Malco Asset
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {malcoCategoryList.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sub Category (dependent) */}
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                      disabled={
                        !selectedCategoryId ||
                        filteredSubCategories.length === 0
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedCategoryId
                                ? filteredSubCategories.length
                                  ? "Select sub category"
                                  : "No sub categories found"
                                : "Select category first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSubCategories.map((sc) => (
                          <SelectItem key={sc._id} value={sc._id}>
                            {sc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Asset Name */}
            <FormField
              control={form.control}
              name="assetName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ABC Fund 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
      </div>

      {/* RIGHT: keep for future (preview, table, etc.) */}
      <div>
        <p className="font-semibold text-lg mb-10 text-center">
          Add User Asset
        </p>
        <AddUserAssetForm users={users} assets={malcoAssets} />
      </div>
    </div>
  );
};

export default PandaConnectPage;
