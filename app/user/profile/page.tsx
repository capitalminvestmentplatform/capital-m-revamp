"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, CircleUserRound } from "lucide-react";
import CustomButton from "@/app/components/Button";

type User = {
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  email: string;
  role: "Admin" | "User";
  clientCode?: string;
  isVerified: boolean;
  firstLogin: boolean;
  image: string;
};

const formSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB

const imageSchema = z.object({
  image: z.any(),
});

const pinSchema = z
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

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEditProfile, setLoadingEditProfile] = useState(false);
  const [loadingEditPin, setLoadingEditPin] = useState(false);
  const [loadingEditImage, setLoadingEditImage] = useState(false);
  const [show, setShow] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const {
    register: pinRegister,
    handleSubmit: handlePinSubmit,
    formState: { errors: pinErrors },
    reset: pinReset,
  } = useForm({
    resolver: zodResolver(pinSchema),
  });
  const {
    register: imageRegister,
    handleSubmit: handleImageSubmit,
    formState: { errors: imageErrors },
    reset: imageReset,
  } = useForm({
    resolver: zodResolver(imageSchema),
  });

  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent with the request
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const user = response.data;

      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });

      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const onSubmit = async (data: any) => {
    setLoadingEditProfile(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      toast.success(response.message);
      reset(); // Reset form on success
      getUserProfile(); // Refresh user profile data
    } catch (error: any) {
      // toast.error(error.message || "Something went wrong");
    } finally {
      setLoadingEditProfile(false);
    }
  };

  const onPinSubmit = async (data: any) => {
    setLoadingEditPin(true);

    try {
      const res = await fetch("/api/profile/change-pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      toast.success(response.message);
    } catch (error: any) {
      // toast.error(error.message || "Something went wrong");
    } finally {
      setLoadingEditPin(false);
    }
  };

  const onImageSubmit = async (data: { image?: File }) => {
    // Handle the image submission logic here

    setLoadingEditImage(true);

    try {
      const formData = new FormData();
      if (data.image) {
        formData.append("image", data.image);
      }
      const res = await fetch("/api/profile/image", {
        method: "PUT",
        body: formData,
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      toast.success(response.message);
    } catch (error: any) {
      // toast.error(error.message || "Something went wrong");
    } finally {
      setLoadingEditImage(false);
    }
  };
  return (
    <div className="flex flex-col items-center p-6">
      <Card className="w-full shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : user ? (
            <div className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <Label>First Name</Label>
                    <Input {...register("firstName")} />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input {...register("lastName")} />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input value={user.username} disabled />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user.email} disabled />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input {...register("phone")} />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input value={user.role} disabled />
                  </div>
                  <div>
                    <Label>Client Code</Label>
                    <Input value={user.clientCode || "N/A"} disabled />
                  </div>
                </div>
                <CustomButton
                  type="submit"
                  classes="mt-6 bg-primaryBG"
                  name="Edit Profile"
                  state={loadingEditProfile}
                />
              </form>
              <div className="lg:flex gap-5">
                <div className="lg:w-1/2">
                  <form onSubmit={handlePinSubmit(onPinSubmit)}>
                    <div
                    //  className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
                    >
                      <div className="relative">
                        <Label>Pin</Label>
                        <Input
                          type={!show ? "password" : "text"}
                          {...pinRegister("password")}
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
                        {pinErrors.password && (
                          <p className="text-red-500 text-sm">
                            {pinErrors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="relative mt-5">
                        <Label>Confirm Pin</Label>
                        <Input
                          type={!show ? "password" : "text"}
                          {...pinRegister("confirmPassword")}
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
                        {pinErrors.confirmPassword && (
                          <p className="text-red-500 text-sm">
                            {pinErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <CustomButton
                      type="submit"
                      classes="mt-6 bg-primaryBG"
                      name="Change Pin"
                      state={loadingEditPin}
                    />
                  </form>
                </div>
                <div className="lg:w-1/2">
                  <form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="relative">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-36 h-36 rounded-full object-cover border"
                          />
                        ) : user.image ? (
                          <img
                            src={user.image}
                            alt="Profile"
                            className="w-36 h-36 rounded-full object-cover border"
                          />
                        ) : (
                          <CircleUserRound size={150} color="#416364" />
                        )}
                      </div>
                    </div>

                    {/* File input styled as button */}
                    <label
                      htmlFor="image"
                      className="inline-block mt-4 bg-primaryBG text-white py-2 px-4 rounded cursor-pointer text-center"
                    >
                      {user.image || previewUrl
                        ? "Change Profile Picture"
                        : "Upload Profile Picture"}
                    </label>

                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      {...imageRegister("image")}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleImageSubmit((data) => {
                          if (file) {
                            const objectUrl = URL.createObjectURL(file);
                            setPreviewUrl(objectUrl);
                            return onImageSubmit({ image: file });
                          }
                        })();
                      }}
                    />

                    {imageErrors?.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {imageErrors.image.message as string}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-red-500">Failed to load user data.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
