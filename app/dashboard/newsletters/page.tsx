"use client";
import { getLoggedInUser } from "@/utils/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

const NewsLetterPage = () => {
  const pathname = usePathname(); // Get the current path

  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  const isAdmin = loggedInUser?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchField, setSearchField] = useState("");

  const [newsletters, setNewsletters] = useState([]);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      const res = await fetch("/api/newsletters");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const newsletters = response.data;
      setNewsletters(newsletters);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    try {
      const res = await fetch(`/api/newsletters/${id}`, {
        method: "DELETE",
        credentials: "include", // Ensure cookies are sent if authentication is needed
      });

      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
      fetchNewsletters();

      return true;
    } catch (error) {
      return false;
    }
  };
  console.log(loggedInUser, "loggedInUser");
  const filteredNewsletters =
    newsletters.length > 0
      ? newsletters.filter((newsletter: any) => {
          if (isAdmin) return true; // Admin sees all
          return newsletter.userId.includes(loggedInUser?.id); // Others see their own
        })
      : [];

  const tableCols =
    role === "Admin"
      ? ["Subject", "Category", "Investment Title", "Action"]
      : ["Subject", "Category", "Investment Title"];

  return (
    <div>
      <div className="my-10 flex justify-end">
        <div className="flex gap-3">
          <Input
            type="text"
            placeholder="Search here"
            onChange={(e) => setSearchField(e.target.value)}
          />
          {role === "Admin" && (
            <Link
              href={`${pathname}/add`}
              className={`bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md text-sm font-semibold w-full text-center`}
            >
              Add newsletter
            </Link>
          )}
        </div>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : newsletters.length === 0 ? (
        <p className="text-center text-gray-500">No Newsletter available</p>
      ) : (
        <DataTable
          tableCols={tableCols}
          tableRows={filteredNewsletters || []}
          handleDelete={handleDeleteNewsletter}
          searchValue={searchField}
        />
      )}
    </div>
  );
};

export default NewsLetterPage;
