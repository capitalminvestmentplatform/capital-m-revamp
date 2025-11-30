"use client";
import React, { useState, useEffect } from "react";
import InvestmentCard from "../../components/investments/InvestmentCard";
import { InvestmentProps } from "@/types/investments";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, List } from "lucide-react";
import { getLoggedInUser } from "@/utils/client";
import DataTable from "../../components/investments/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const InvestmentsPage = () => {
  const role = getLoggedInUser()?.role;
  const pathname = usePathname(); // Get the current path

  const [investments, setInvestments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [view, setView] = useState("grid");

  // // Controlled input (user types/selects)
  // const [searchInput, setSearchInput] = useState("");
  // const [sortByInput, setSortByInput] = useState<string[]>(["createdAt"]);
  // const [sortOrderInput, setSortOrderInput] = useState<("asc" | "desc")[]>([
  //   "desc",
  // ]);

  // // Applied filters (used in API call)
  // const [search, setSearch] = useState("");
  // const [sortBy, setSortBy] = useState<string[]>(["createdAt"]);
  // const [sortOrder, setSortOrder] = useState<("asc" | "desc")[]>(["desc"]);

  // const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchCategories();
    fetchInvestments();
  }, []);

  // useEffect(() => {
  //   fetchInvestments();
  // }, [search, page, limit, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        throw new Error("Network res was not ok");
      }
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      const categories = response.data;
      setCategories(categories);
    } catch (error) {
      return (error as Error).message;
    }
  };

  const fetchInvestments = async () => {
    try {
      // const params = new URLSearchParams({
      //   search,
      //   page: page.toString(),
      //   limit: limit.toString(),
      //   sortBy: sortBy.join(","), // e.g. "title,createdAt"
      //   sortOrder: sortOrder.join(","), // e.g. "asc,desc"
      // });

      const res = await fetch(
        `/api/products?mode=simple`
        // &${params.toString()}
      );
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      setInvestments(response.data);
      // Optionally set totalPages, currentPage etc.
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      toast.success(response.message);
      fetchInvestments(); // Refresh the investments list
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    }
  };

  const filteredInvestments =
    investments?.length > 0 &&
    investments.filter((investment: InvestmentProps) => {
      const isCategoryMatch =
        category === "all" || investment.category === category;

      const today = new Date();
      const expirationDate = investment.expirationDate
        ? new Date(investment.expirationDate)
        : null;

      const isNotExpired = expirationDate ? expirationDate >= today : true;

      if (role === "Admin") {
        // ✅ Admin can see everything
        return isCategoryMatch;
      } else {
        return isCategoryMatch && isNotExpired && !!investment.status;
      }
    });

  const tableCols =
    role === "Admin"
      ? [
          "Investment ID",
          "Title",
          "Thumbnail",
          "Category",
          "Expected Profit",
          "Investment Duration",
          "Status",
          "Actions", // Only include Actions column for Admin
        ]
      : [
          "Investment ID",
          "Title",
          "Thumbnail",
          "Category",
          "Expected Profit",
          "Investment Duration",
          "Status",
        ];

  return (
    <div className="">
      <div className="flex flex-wrap gap-4 mb-5 mt-10">
        <div
          className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-md cursor-pointer"
          onClick={() => setCategory("all")}
        >
          View All
        </div>
        {categories.map((category: any, index: number) => (
          <div
            key={index}
            className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-md cursor-pointer"
            onClick={() => setCategory(category.name)}
          >
            {category.name}
          </div>
        ))}
      </div>

      <div className="my-10 flex justify-between items-center">
        {/* <div className="flex items-center gap-5">
          <Label className="text-sm w-full">Search by: </Label>

          <Input
            type="text"
            placeholder="Search by title or category"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-fit text-sm"
          />

          <Label className="text-sm">Sort by: </Label>

          <Select
            value={sortByInput[0]}
            onValueChange={(value) => {
              setSortByInput([value]);
              setSortOrderInput(["asc"]); // or preserve old order
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="createdAt">Created At</SelectItem>
              <SelectItem value="minInvestment">Min Investment</SelectItem>
              <SelectItem value="currentValue">Current Value</SelectItem>
              <SelectItem value="expectedValue">Expected Value</SelectItem>
            </SelectContent>
          </Select>

          <Label className="text-sm">Order by: </Label>

          <Button
            variant="outline"
            onClick={() =>
              setSortOrderInput([sortOrderInput[0] === "asc" ? "desc" : "asc"])
            }
          >
            {sortOrderInput[0] === "asc" ? "↑ Ascending" : "↓ Descending"}
          </Button>
          <Button
            onClick={() => {
              setSearch(searchInput);
              setSortBy([...sortByInput]);
              setSortOrder([...sortOrderInput]);
              setPage(1); // reset to first page on filter
            }}
          >
            Apply
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setSearchInput("");
              setSortByInput(["createdAt"]);
              setSortOrderInput(["desc"]);

              // Also reset applied filters
              setSearch("");
              setSortBy(["createdAt"]);
              setSortOrder(["desc"]);
              setPage(1);
            }}
          >
            Reset
          </Button>
        </div> */}

        <div className="flex gap-4">
          <div
            className={`bg-gray-200 rounded-md p-2 cursor-pointer ${view === "grid" ? "bg-primaryBG text-white" : "initial"}`}
            onClick={() => setView("grid")}
          >
            <Grid size={20} />
          </div>
          <div
            className={`bg-gray-200 rounded-md p-2 cursor-pointer ${view === "list" ? "bg-primaryBG text-white" : "initial"}`}
            onClick={() => setView("list")}
          >
            <List size={20} />
          </div>
        </div>

        {role === "Admin" && (
          <Link
            href={`${pathname}/add`}
            className={`bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md text-sm font-semibold`}
          >
            Add new investment
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : filteredInvestments?.length === 0 ? (
        <p className="text-center text-gray-500">No investments available</p>
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.isArray(filteredInvestments) &&
                filteredInvestments.map(
                  (investment: InvestmentProps, index: number) => (
                    <InvestmentCard
                      key={index}
                      investment={investment}
                      handleDelete={handleDelete}
                      role={role || "User"}
                    />
                  )
                )}
            </div>
          ) : (
            <DataTable
              tableCols={tableCols}
              tableRows={filteredInvestments || []}
              handleDelete={handleDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default InvestmentsPage;
