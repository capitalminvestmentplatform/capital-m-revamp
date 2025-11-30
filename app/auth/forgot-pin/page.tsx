"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, KeyRound, EyeOff, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import CustomButton from "@/app/components/Button";

const formSchema = z.object({
  email: z.string().min(1, "Required"),
});

const ForgotPinPage = () => {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (payload: { email: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // Ensures cookies are sent with the request
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="grid lg:grid-cols-10 h-screen w-full">
      <div className="lg:col-span-7 bg-heroBackground bg-cover bg-center h-full px-16 py-10 flex flex-col justify-between">
        <Image
          src="/images/company/logo.png"
          alt="brand"
          width={150}
          height={70}
        />
        <div className="">
          <h1 className="text-4xl text-white mb-7">
            Welcome to
            <span className="uppercase font-semibold text-5xl"> capital m</span>
            <span className="font-semibold text-5xl"> Investments</span>
          </h1>
          <p className="text-white text-lg mb-10">
            Capital M is the platform for Sheikh Mostafa Bin Abdullatif's Family
            members to manage <br /> their wealth more efficiently and getting
            access to unique investment opportunities.
          </p>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:col-span-3 h-full w-full px-16 py-5 lg:py-16"
      >
        <h1 className="text-4xl font-bold mt-10 mb-10">Reset your pin</h1>
        <div className="relative mb-7">
          <Label htmlFor="email">Enter your Email/Client code</Label>
          <Input
            {...register("email")}
            placeholder="Enter email"
            className="mt-1 ps-10 py-5"
          />
          <Mail className="absolute left-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5" />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <CustomButton
          type="submit"
          classes="me-3 bg-primaryBG"
          name="Reset Pin"
          state={loading}
        />
      </form>
    </div>
  );
};

export default ForgotPinPage;
