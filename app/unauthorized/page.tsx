"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-800">Access Denied</h1>
      <p className="text-gray-600 mt-2">
        You do not have permission to view this page.
      </p>
      <div className="mt-6 space-x-4">
        <Button variant="default" onClick={() => router.push("/")}>
          Go to Home
        </Button>
        <Button variant="outline" onClick={() => router.push("/auth/login")}>
          Login as Admin
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
