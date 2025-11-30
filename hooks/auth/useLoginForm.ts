import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { useLoginMutation } from "@/hooks/auth/useLoginMutation";
import { error, log } from "@/lib/logger";

const formSchema = z.object({
  email: z.string().min(1, "Required"),
  password: z.string().min(1, "Pin is required"),
});

export const useLoginForm = () => {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const loginMutation = useLoginMutation();

  const onSubmit = async (payload: any) => {
    try {
      log("Login payload", payload);
      const res = await loginMutation.mutateAsync(payload);

      console.log("res", res);
      if (res.statusCode !== 200) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setUser(res.data);

      setTimeout(() => {
        router.push(res.data.firstLogin ? "/auth/set-pin" : "/dashboard");
      }, 2000);
    } catch (err: any) {
      toast.error(err.response.data?.message || "Login failed");
      error("Login error", err);
    }
  };

  useEffect(() => {
    if (user) {
      if (user?.firstLogin) router.replace("/auth/set-pin");
      else router.replace("/dashboard");
    }
  }, [user]);

  return {
    ...form,
    onSubmit,
    loading: loginMutation.isPending,
    showPassword,
    setShowPassword,
  };
};
