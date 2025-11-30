"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ReactSelect from "react-select";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CustomButton from "@/app/components/Button";
import RichTextEditor from "@/app/components/textEditor/RichTextEditor";
import { processTiptapImages } from "@/utils/client";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  pId: z.string().optional(),
  users: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

const AddNewsletterPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    control,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    fetchCategories();
    fetchInvestments();
    fetchUsers();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const response = await res.json();
      if (response.statusCode !== 200) throw new Error(response.message);
      setCategories(response.data);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const fetchInvestments = async () => {
    try {
      const res = await fetch("/api/products");
      const response = await res.json();
      if (response.statusCode !== 200) throw new Error(response.message);
      setInvestments(response.data);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users?all=true", {
        method: "GET",
        credentials: "include",
      });
      const response = await res.json();
      if (response.statusCode !== 200) throw new Error(response.message);
      setUsers(response.data.users);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    let users = data.users?.map((user) => user.value) || [];
    let description = data.description || "";
    if (data.description) {
      // Process images in the description
      description = await processTiptapImages(
        description,
        `newsletters/${data.subject}/description`
      );
    }

    let payload = {
      ...data,
      users,
      description,
    };
    try {
      const res = await fetch("/api/newsletters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await res.json();
      if (response.statusCode !== 201) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message || "Newsletter created successfully");

      setTimeout(() => {
        router.push("/dashboard/newsletters");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = selectedCategory
    ? investments.filter((inv) => inv.category === selectedCategory)
    : [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-3 lg:p-6 bg-white rounded-lg shadow grid grid-cols-2 gap-5"
    >
      <div>
        <Label>Subject</Label>
        <Input {...register("subject")} placeholder="Enter subject" />
        {errors.subject && (
          <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
        )}
      </div>
      <div>
        <Label>Users (Optional)</Label>
        <Controller
          control={control}
          name="users"
          render={({ field }) => (
            <ReactSelect
              isMulti
              options={
                users.length > 0
                  ? users.map((u) => ({
                      value: u._id,
                      label: `${u.firstName} ${u.lastName}`,
                    }))
                  : []
              }
              value={field.value}
              onChange={field.onChange}
              placeholder="Select users..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
          )}
        />
        {errors.users && (
          <p className="text-red-500 text-sm mt-1">{errors.users.message}</p>
        )}
      </div>

      <div>
        <Label>Category</Label>
        <Select onValueChange={(value) => setValue("category", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <div>
        <Label>Opportunity (Optional)</Label>
        <Select onValueChange={(value) => setValue("pId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select opportunity" />
          </SelectTrigger>
          <SelectContent>
            {selectedCategory &&
              filteredOpportunities.map((opp) => (
                <SelectItem key={opp._id} value={opp._id}>
                  {opp.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor content={field.value} onChange={field.onChange} />
          )}
        />
      </div>
      <CustomButton
        type="submit"
        classes="mt-6 bg-primaryBG w-fit"
        name="Send Newsletter"
        state={loading}
      />
    </form>
  );
};

export default AddNewsletterPage;
