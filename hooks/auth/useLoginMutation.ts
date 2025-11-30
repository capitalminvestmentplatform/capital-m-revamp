import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

interface LoginPayload {
  email: string;
  password: string;
}

export const useLoginMutation = () =>
  useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await apiClient.post("/api/auth/login", payload);
      return response.data;
    },
  });
