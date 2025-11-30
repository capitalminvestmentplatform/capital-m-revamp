"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, KeyRound, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CustomButton from "@/app/components/Button";
import { useLoginForm } from "@/hooks/auth/useLoginForm";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    onSubmit,
    loading,
    showPassword,
    setShowPassword,
  } = useLoginForm();

  return (
    <div className="grid lg:grid-cols-10 h-screen w-full">
      {/* Left side panel */}
      <div className="bg-heroBackground lg:col-span-7 bg-cover bg-center h-full px-16 py-10 flex flex-col justify-between">
        <Image
          src="/images/company/logo.png"
          alt="brand"
          width={150}
          height={70}
        />
        <div>
          <h1 className="text-4xl text-white mb-7">
            Welcome to
            <span className="uppercase font-semibold text-5xl"> capital m</span>
            <span className="font-semibold text-5xl"> Investments</span>
          </h1>
          <p className="text-white text-lg mb-10">
            Capital M is the platform for Sheikh Mostafa Bin Abdullatif's Family
            members to manage their wealth more efficiently and get access to
            unique investment opportunities.
          </p>
        </div>
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:col-span-3 h-full w-full px-16 py-5 lg:py-16"
      >
        <h1 className="text-4xl font-bold lg:mt-10 mb-10">Access Portal</h1>

        {/* Email Field */}
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

        {/* Password Field */}
        <div className="relative mb-7">
          <Label htmlFor="password">Enter your Pin</Label>
          <KeyRound className="absolute left-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5" />
          <Input
            type={!showPassword ? "password" : "text"}
            {...register("password")}
            placeholder="Enter 4-digit pin"
            className="mt-1 ps-10 py-5"
          />
          {!showPassword ? (
            <EyeOff
              className="absolute right-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5 cursor-pointer"
              onClick={() => setShowPassword(true)}
            />
          ) : (
            <Eye
              className="absolute right-3 top-1/2 mt-4 -translate-y-1/2 w-5 h-5 cursor-pointer"
              onClick={() => setShowPassword(false)}
            />
          )}
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <CustomButton
          type="submit"
          name="Login"
          classes="me-3 bg-primaryBG"
          state={loading}
        />

        <Link
          href="/auth/forgot-pin"
          className="text-sm hover:underline mt-4 block"
        >
          Forgot pin?
        </Link>
      </form>
    </div>
  );
};

export default LoginPage;
