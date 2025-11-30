"use client";
import React, { useEffect, useState } from "react";

import { toast } from "sonner";
import { InvestmentProps } from "@/types/investments";
import Link from "next/link";
import InvestmentCard from "../components/investments/InvestmentCard";
import PandaConnect from "./PandaConnect";
import { getLoggedInUser } from "@/utils/client";

const DashboardPage: React.FC = () => {
  const { role, name, email } = getLoggedInUser() || { role: "" };

  const [investments, setInvestments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [mostRecentStatement, setMostRecentStatement] = useState("");

  useEffect(() => {
    fetchInvestments();
    fetchCategories();
    if (role !== "Admin") {
      fetchStatements();
    }
  }, []);

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
      const res = await fetch("/api/products");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const investments = response.data;
      setInvestments(investments);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const fetchStatements = async () => {
    try {
      const res = await fetch("/api/statements");

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }

      const statements = response.data;
      // Month mapping to numerical value
      const monthOrder: any = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };

      // Sort only by year and month
      const sortedStatements =
        statements?.length > 0 &&
        statements
          .filter((statement: any) => statement.email === email)
          .sort((a: any, b: any) => {
            if (b.year !== a.year) return b.year - a.year;
            return monthOrder[b.month] - monthOrder[a.month];
          });
      const mostRecentPdf = sortedStatements[0]?.pdf || null;
      setMostRecentStatement(mostRecentPdf);
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
    investments.length > 0 &&
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

  return (
    <div className="container mx-auto max-w-[1440px] px-4">
      <p className="text-2xl mb-1 font-semibold">
        Welcome {name} - Current Statement Insights
      </p>
      <p className="text-sm text-gray-500 mb-5">
        From here, you can access all your investment information and manage
        your account portfolio.
      </p>
      {/* {role !== "Admin" && mostRecentStatement && (
        <div className="w-full h-[600px] border rounded overflow-hidden">
          <iframe
            src={`${mostRecentStatement}#view=FitH&navpanes=0&scrollbar=0`}
            title="Latest Statement PDF"
            className="w-full h-full"
          />
        </div>
      )} */}
      {role !== "Admin" && <PandaConnect />}

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
      <div className="flex justify-between items-center mb-10">
        <p className="text-2xl mb-1">New Investment Opportunities</p>

        <Link
          href={"/dashboard/investments"}
          className="text-sm hover:underline"
        >
          View All
        </Link>
      </div>
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : investments.length === 0 ? (
        <p className="text-center text-gray-500">No investments available</p>
      ) : (
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
      )}
    </div>
  );
};

export default DashboardPage;
