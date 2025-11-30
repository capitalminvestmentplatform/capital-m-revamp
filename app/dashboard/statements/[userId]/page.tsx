"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import DataTable from "../DataTable";
import Pagination from "@/app/components/Pagination";
import SearchBar from "@/app/components/SearchBar";
import { toast } from "sonner";
import { getLoggedInUser } from "@/utils/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type StatementRow = {
  _id: string;
  month: string;
  year: number;
  pdf: string;
  createdAt: string;
  username?: string;
  email?: string;
  clientCode?: string;
};

export default function UserStatementsPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const me = getLoggedInUser();
  const isAdmin = me?.role === "Admin";

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StatementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<"createdAt" | "month" | "year">(
    "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");

  // Header meta from API (not from URL)
  const [headerName, setHeaderName] = useState<string>("");
  const [headerCode, setHeaderCode] = useState<string>("");

  const fetchUserMetaFallback = async () => {
    // Optional: if you have /api/users/:id
    try {
      const res = await fetch(`/api/users/${userId}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json?.statusCode === 200 && json?.data?.user) {
        const u = json.data.user;
        const name = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        setHeaderName(name);
        setHeaderCode(u.clientCode || "");
      }
    } catch {
      // ignore; fall back to userId display
    }
  };

  const fetchUser = async (
    p = page,
    l = pageSize,
    sf = sortField,
    so = sortOrder,
    q = search
  ) => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({
        page: String(p),
        limit: String(l),
        sortBy: sf,
        sortOrder: so,
      });
      if (q) qs.set("search", q);

      const res = await fetch(
        `/api/statements/user/${userId}?${qs.toString()}`,
        {
          credentials: "include",
        }
      );
      const json = await res.json();
      if (json.statusCode !== 200) throw new Error(json.message);

      const { items, username, clientCode, pagination } = json.data as {
        items: StatementRow[];
        pagination: any;
      };
      setRows(items || []);
      setTotal(pagination?.total || 0);

      // Populate header from statements API if available

      if (username) {
        if (!headerName) setHeaderName(username);
        if (!headerCode) setHeaderCode(clientCode);
      } else {
        // No statements: try user profile endpoint (if present)
        await fetchUserMetaFallback();
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Load when userId changes
  useEffect(() => {
    if (!userId) return;
    setHeaderName("");
    setHeaderCode("");
    fetchUser(1, pageSize, sortField, sortOrder, search);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/statements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.statusCode !== 200) {
        toast.error(json.message);
        return false;
      }
      toast.success(json.message);
      await fetchUser(page, pageSize, sortField, sortOrder, search);
      return true;
    } catch {
      return false;
    }
  };

  const tableCols = isAdmin
    ? ["Month", "Year", "Statement", "Action"]
    : ["Month", "Year", "Statement"];

  return (
    <div className="space-y-4">
      {/* Header (name/clientCode from API) */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">
              Statements — {headerName || headerCode || userId}
            </h1>
            {headerCode ? (
              <p className="text-xs text-muted-foreground">
                Client Code: {headerCode}
              </p>
            ) : null}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-primaryBG text-white hover:bg-primaryBG hover:text-white"
            onClick={() => router.push("/dashboard/statements")}
          >
            Back
          </Button>
        </div>
      </Card>

      {/* Toolbar */}
      <Card className="p-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={async () => {
            setPage(1);
            await fetchUser(1, pageSize, sortField, sortOrder, search.trim());
          }}
          sortField={sortField}
          onSortFieldChange={async (f) => {
            const ff = f as "createdAt" | "month" | "year";
            setSortField(ff);
            setPage(1);
            await fetchUser(1, pageSize, ff, sortOrder, search.trim());
          }}
          sortOrder={sortOrder}
          onSortOrderToggle={async () => {
            const o = sortOrder === "asc" ? "desc" : "asc";
            setSortOrder(o);
            setPage(1);
            await fetchUser(1, pageSize, sortField, o, search.trim());
          }}
          onReset={async () => {
            setSearch("");
            setSortField("createdAt");
            setSortOrder("desc");
            setPage(1);
            await fetchUser(1, pageSize, "createdAt", "desc", "");
          }}
          placeholder="Search by month/year (e.g., Dec 2022)"
          sortFields={[
            { label: "Created At", value: "createdAt" },
            { label: "Month", value: "month" },
            { label: "Year", value: "year" },
          ]}
        />
      </Card>

      {/* Table + Pagination */}
      <Card className="p-3 sm:p-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-center text-muted-foreground">No statements</p>
        ) : (
          <>
            <DataTable
              mode="user"
              tableCols={tableCols}
              tableRows={rows}
              handleDelete={handleDelete}
            />
            <Separator className="my-3" />
            <Pagination
              page={page}
              total={total}
              totalPages={Math.max(1, Math.ceil(total / pageSize))}
              onChange={async (p) => {
                setPage(p);
                await fetchUser(
                  p,
                  pageSize,
                  sortField,
                  sortOrder,
                  search.trim()
                );
              }}
              pageSize={pageSize}
              onPageSizeChange={async (n) => {
                setPageSize(n);
                setPage(1);
                await fetchUser(1, n, sortField, sortOrder, search.trim());
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}
