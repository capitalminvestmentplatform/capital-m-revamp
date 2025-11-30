"use client";
import { useForm } from "react-hook-form";
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
import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CustomButton from "@/app/components/Button";

const formSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().refine((val) => /^\d{4}$/.test(val), {
      message: "Pin must be exactly 4 digits (numbers only)",
    }),
    confirmPassword: z.string().refine((val) => /^\d{4}$/.test(val), {
      message: "Pin must be exactly 4 digits (numbers only)",
    }),
    clientCode: z.string().optional(),
    role: z.enum(["Admin", "User"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Pins do not match",
    path: ["confirmPassword"],
  });

const AddUserPage = () => {
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const role = watch("role"); // Watching role to conditionally disable clientCode input

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.statusCode !== 201) {
        toast.error(response.message);
        return false;
      }

      toast.success(response.message);
      reset(); // Reset form on success

      setTimeout(() => {
        router.push("/dashboard/users");
      }, 2000);
    } catch (error: any) {
      // toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-3 lg:p-6 bg-white rounded-lg shadow"
    >
      <div className="lg:grid gap-4">
        <div>
          <Label>Username</Label>
          <Input {...register("username")} placeholder="Enter username" />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>

        <div>
          <Label>Email ID</Label>
          <Input {...register("email")} placeholder="Enter email" />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label>First Name</Label>
          <Input {...register("firstName")} placeholder="Enter first name" />
        </div>

        <div>
          <Label>Last Name</Label>
          <Input {...register("lastName")} placeholder="Enter last name" />
        </div>

        <div>
          <Label>Mobile No</Label>
          <Input {...register("phone")} placeholder="Enter mobile number" />
        </div>

        <div>
          <Label>Select Role Type</Label>
          <Select
            onValueChange={(value) =>
              setValue("role", value as "Admin" | "User")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="User">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Label>Pin</Label>
          <Input
            type={!show ? "password" : "text"}
            {...register("password")}
            placeholder="Enter 4-digit pin"
            inputMode="numeric"
            pattern="\d{4}"
          />
          {!show ? (
            <EyeOff
              className="absolute right-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5 cursor-pointer"
              onClick={() => setShow(!show)}
            />
          ) : (
            <Eye
              className="absolute right-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5 cursor-pointer"
              onClick={() => setShow(!show)}
            />
          )}
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="relative">
          <Label>Confirm Pin</Label>
          <Input
            type={!show ? "password" : "text"}
            {...register("confirmPassword")}
            placeholder="Confirm 4-digit pin"
            inputMode="numeric"
            pattern="\d{4}"
          />
          {!show ? (
            <EyeOff
              className="absolute right-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5 cursor-pointer"
              onClick={() => setShow(!show)}
            />
          ) : (
            <Eye
              className="absolute right-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5 cursor-pointer"
              onClick={() => setShow(!show)}
            />
          )}
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <Label>Client Code</Label>
          <Input
            {...register("clientCode")}
            placeholder="Enter client code"
            disabled={role === "Admin"} // Disable input if role is Admin
          />
        </div>
      </div>

      <CustomButton
        type="submit"
        classes="mt-6 bg-primaryBG"
        name="Add User"
        state={loading}
      />
    </form>
  );
};

export default AddUserPage;
