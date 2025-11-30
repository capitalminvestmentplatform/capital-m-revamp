"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, EyeOff, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import CustomButton from "@/app/components/Button";

const formSchema = z
  .object({
    password: z.string().refine((val) => /^\d{4}$/.test(val), {
      message: "Pin must be exactly 4 digits (numbers only)",
    }),
    confirmPassword: z.string().refine((val) => /^\d{4}$/.test(val), {
      message: "Pin must be exactly 4 digits (numbers only)",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Pins do not match",
    path: ["confirmPassword"],
  });

const SetPasswordPage = () => {
  const router = useRouter();

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      console.error("error:", error);
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
        <h1 className="text-4xl font-bold mt-10 mb-10">Set New Pin</h1>
        <div className="relative mb-7">
          <Label htmlFor="password">Enter your new pin</Label>
          <KeyRound className="absolute left-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5" />
          <Input
            type={!show ? "password" : "text"}
            {...register("password")}
            placeholder="Enter 4-digit pin"
            inputMode="numeric"
            pattern="\d{4}"
            className="mt-1 ps-10 py-5"
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

        <div className="relative mb-7">
          <Label htmlFor="confirmPassword">Confirm pin</Label>
          <KeyRound className="absolute left-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5" />
          <Input
            type={!show ? "password" : "text"}
            {...register("confirmPassword")}
            placeholder="Confirm 4-digit pin"
            inputMode="numeric"
            pattern="\d{4}"
            className="mt-1 ps-10 py-5"
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

export default SetPasswordPage;
