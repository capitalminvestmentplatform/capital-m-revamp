"use client";
import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const VerifyResetPinPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [message, setMessage] = useState("Verifying...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token not found in URL");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch("/api/auth/verify-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const response = await res.json();

        if (response.statusCode !== 200) {
          toast.error(response.message);
          throw new Error(response.message);
        }

        setMessage(response.message);

        setTimeout(() => {
          router.push("/auth/reset-pin");
        }, 2000);
      } catch (err: any) {
        setError(err.message);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <p className="text-green-500">{message}</p>
      )}
    </div>
  );
};

export default VerifyResetPinPage;
