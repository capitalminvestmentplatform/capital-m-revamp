"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReactSelect from "react-select";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import CustomButton from "@/app/components/Button";
import RichTextEditor from "@/app/components/textEditor/RichTextEditor";
import { processTiptapImages } from "@/utils/client";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  investmentId: z.string().optional(),
  users: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

const EditNewsletterPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const newsletterId = id;
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
    control,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    if (!newsletterId) return;

    const loadData = async () => {
      try {
        await fetchCategories();
        await fetchInvestments();

        // ✅ Fetch users and store locally
        const resUsers = await fetch("/api/users?all=true", {
          credentials: "include",
        });
        const userResponse = await resUsers.json();
        if (userResponse.statusCode !== 200)
          throw new Error(userResponse.message);
        const fetchedUsers = userResponse.data.users;
        setUsers(fetchedUsers); // ✅ still update UI state

        // ✅ Fetch newsletter
        const resNewsletter = await fetch(`/api/newsletters/${newsletterId}`);
        const newsletterResponse = await resNewsletter.json();
        if (newsletterResponse.statusCode !== 200)
          throw new Error(newsletterResponse.message);
        const data = newsletterResponse.data;

        // ✅ Match user IDs to user objects without waiting for state
        const matchedUsers =
          data.userId
            ?.map((userId: string) => {
              const user = fetchedUsers.find((u: any) => u._id === userId);
              return user
                ? {
                    value: user._id,
                    label: `${user.firstName} ${user.lastName}`,
                  }
                : null;
            })
            .filter(Boolean) || [];
        reset({
          subject: data.subject,
          description: data.description,
          category: data.category,
          investmentId: data?.investmentId || "",
          users: matchedUsers,
        });
      } catch (err) {
        toast.error((err as Error).message || "Failed to load newsletter");
      }
    };

    loadData();
  }, [newsletterId]);

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    let users = data.users?.map((user) => user.value) || [];
    let description = data.description || "";
    if (data.description) {
      description = await processTiptapImages(
        description,
        `newsletters/${data.subject}/description`
      );
    }

    const payload = {
      ...data,
      users,
      description,
    };

    try {
      const res = await fetch(`/api/newsletters/${newsletterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        return;
      }

      toast.success("Newsletter updated successfully");
      setTimeout(() => {
        router.push("/dashboard/newsletters");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // const filteredOpportunities = selectedCategory
  //   ? investments.filter((inv) => inv.category === selectedCategory)
  //   : [];

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
              options={users.map((u) => ({
                value: u._id,
                label: `${u.firstName} ${u.lastName}`,
              }))}
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
        <Select
          onValueChange={(value) => setValue("category", value)}
          value={watch("category") || ""}
        >
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

      <Controller
        control={control}
        name="investmentId"
        render={({ field }) => {
          const currentId = field.value;
          const selectedInvestment = investments.find(
            (inv) => inv._id === currentId
          );
          const filtered = investments.filter(
            (inv) => inv.category === selectedCategory
          );

          const options =
            selectedInvestment &&
            !filtered.some((f) => f._id === selectedInvestment._id)
              ? [selectedInvestment, ...filtered]
              : filtered;

          return (
            <div>
              <Label>Opportunity (Optional)</Label>
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select opportunity" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((inv) => (
                    <SelectItem key={inv._id} value={inv._id}>
                      {inv.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }}
      />

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
        name="Update Newsletter"
        state={loading}
      />
    </form>
  );
};

export default EditNewsletterPage;
