"use client";

import { getLoggedInUser, uploadFileToCloudinary } from "@/utils/client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable from "./DataTable";
import { AddStatementModal } from "@/app/components/modals/AddStatementModal";
import { useServerTable } from "@/hooks/useServerTable";
import SearchBar from "@/app/components/SearchBar";
import Pagination from "@/app/components/Pagination";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_LIMIT = 10;

type LatestRow = {
  userId: string;
  username: string;
  email: string;
  clientCode: string;
  statementsCount: number;
  latestStatementId: string;
  latestMonth: string;
  latestYear: number;
  latestCreatedAt: string;
  latestPdf: string;
};

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

const StatementsPage = () => {
  const router = useRouter();
  const me = getLoggedInUser();
  const isAdmin = me?.role === "Admin";
  const myUserId = me?.id; // ✅ prefer _id

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Admin: grouped rows (latest per user)
  const [latestRows, setLatestRows] = useState<LatestRow[]>([]);
  const [users, setUsers] = useState<any[]>([]); // for AddStatementModal

  // Client/self table state
  const [userStatements, setUserStatements] = useState<StatementRow[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [userSortField, setUserSortField] = useState<
    "createdAt" | "month" | "year" | "clientCode"
  >("createdAt");
  const [userSortOrder, setUserSortOrder] = useState<"asc" | "desc">("desc");
  const [userSearch, setUserSearch] = useState("");

  // ===== ADMIN: grouped controller (pagination + full search/sort now) =====
  const table = useServerTable<LatestRow>({
    initialPageSize: DEFAULT_LIMIT,
    initialSortField: "createdAt",
    initialSortOrder: "desc",
    fetcher: async ({ page, limit, search, sortBy, sortOrder }) => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (search) params.set("search", search); // server: clientCode OR month/year

      const res = await fetch(`/api/statements?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json();
      if (json.statusCode !== 200) {
        throw new Error(json.message || "Failed to fetch statements");
      }
      const { items, pagination } = json.data;
      return { items, total: pagination.total };
    },
  });

  // ===== CLIENT / SELF: fetcher against /api/statements/user/:id =====
  const fetchSelfStatements = async (
    page: number,
    limit: number,
    sortBy: "createdAt" | "month" | "year" | "clientCode",
    sortOrder: "asc" | "desc",
    search?: string
  ) => {
    if (!myUserId) return;
    try {
      setUserLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
      });
      if (search) params.set("search", search);

      const res = await fetch(
        `/api/statements/user/${myUserId}?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const json = await res.json();
      if (json.statusCode !== 200) throw new Error(json.message);

      const { items, pagination } = json.data;
      setUserStatements(items || []);
      setUserTotal(pagination.total || 0);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUserLoading(false);
    }
  };

  // INIT
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (isAdmin) {
          // Admin → grouped by users
          const items = await table.fetchPage();
          setLatestRows(items);

          // preload users for AddStatementModal
          const res = await fetch(`/api/users?all=true`, {
            credentials: "include",
          });
          const u = await res.json();
          if (u.statusCode === 200) setUsers(u.data.users || []);
        } else if (myUserId) {
          // Client → directly load own statements
          await fetchSelfStatements(
            1,
            userPageSize,
            userSortField,
            userSortOrder,
            userSearch
          );
          setUserPage(1);
        }
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // ADMIN refresh when paging/search/sort changes
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        setLoading(true);
        const items = await table.fetchPage();
        setLatestRows(items);
      } catch (e) {
        setError((e as Error).message);
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [
    isAdmin,
    table.page,
    table.pageSize,
    table.search,
    table.sortField,
    table.sortOrder,
  ]);

  // Add/Delete handling
  const handleAddStatement = async (data: any) => {
    try {
      const file = new File([data.pdf?.[0]], "statement.pdf", {
        type: "application/pdf",
      });
      let pdfUrl = "";
      if (file) {
        pdfUrl =
          (await uploadFileToCloudinary(file, `statements/${data.userId}`)) ??
          "";
      }

      const payload = {
        userId: data.userId,
        month: data.month,
        year: +data.year,
        pdf: pdfUrl,
      };
      const res = await fetch(`/api/statements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await res.json();
      if (response.statusCode !== 201) {
        toast.error(response.message);
        return false;
      }
      toast.success(response.message);

      if (isAdmin) {
        const items = await table.fetchPage();
        setLatestRows(items);
      } else if (myUserId) {
        await fetchSelfStatements(
          userPage,
          userPageSize,
          userSortField,
          userSortOrder,
          userSearch
        );
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteStatement = async (id: string) => {
    try {
      const res = await fetch(`/api/statements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const response = await res.json();

      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);

      if (isAdmin) {
        const items = await table.fetchPage();
        setLatestRows(items);
      } else if (myUserId) {
        await fetchSelfStatements(
          userPage,
          userPageSize,
          userSortField,
          userSortOrder,
          userSearch
        );
      }
      return true;
    } catch {
      return false;
    }
  };

  // Columns
  const latestCols = isAdmin
    ? [
        "User",
        "Client Code",
        "Latest Month",
        "Latest Year",
        "Total",
        "Statement",
      ]
    : [];
  const detailsCols = isAdmin
    ? ["Month", "Year", "Statement", "Action"]
    : ["Month", "Year", "Statement"];

  return (
    <div className="space-y-4">
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {isAdmin ? (
            <SearchBar
              value={table.searchInput}
              onChange={table.setSearchInput}
              onSearch={() => {
                table.setPage(1);
                table.applySearch(); // server: clientCode OR month/year
              }}
              sortField={table.sortField}
              onSortFieldChange={(f) => {
                table.setPage(1);
                table.setSortField(f as "createdAt" | "month" | "year");
              }}
              sortOrder={table.sortOrder}
              onSortOrderToggle={() => {
                table.setPage(1);
                table.toggleSortOrder();
              }}
              onReset={() => {
                table.resetAll();
              }}
              placeholder="Search client code or month/year (e.g., Dec 2022)"
              sortFields={[
                { label: "Created At", value: "createdAt" },
                { label: "Month", value: "month" },
                { label: "Year", value: "year" },
                { label: "Client Code", value: "clientCode" },
              ]}
            />
          ) : (
            <SearchBar
              value={userSearch}
              onChange={setUserSearch}
              onSearch={async () => {
                setUserPage(1);
                await fetchSelfStatements(
                  1,
                  userPageSize,
                  userSortField,
                  userSortOrder,
                  userSearch.trim()
                );
              }}
              sortField={userSortField}
              onSortFieldChange={async (f) => {
                const ff = f as "createdAt" | "month" | "year" | "clientCode";
                setUserSortField(ff);
                setUserPage(1);
                await fetchSelfStatements(
                  1,
                  userPageSize,
                  ff,
                  userSortOrder,
                  userSearch.trim()
                );
              }}
              sortOrder={userSortOrder}
              onSortOrderToggle={async () => {
                const o = userSortOrder === "asc" ? "desc" : "asc";
                setUserSortOrder(o);
                setUserPage(1);
                await fetchSelfStatements(
                  1,
                  userPageSize,
                  userSortField,
                  o,
                  userSearch.trim()
                );
              }}
              onReset={async () => {
                setUserSearch("");
                setUserSortField("createdAt");
                setUserSortOrder("desc");
                setUserPage(1);
                await fetchSelfStatements(
                  1,
                  userPageSize,
                  "createdAt",
                  "desc",
                  ""
                );
              }}
              placeholder="Search by month/year (e.g., Dec 2022)"
              sortFields={[
                { label: "Created At", value: "createdAt" },
                { label: "Month", value: "month" },
                { label: "Year", value: "year" },
              ]}
            />
          )}

          {isAdmin && (
            <AddStatementModal users={users} onSubmit={handleAddStatement} />
          )}
        </div>
      </Card>

      {loading ? (
        <Card className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <p className="text-center text-destructive">{error}</p>
        </Card>
      ) : isAdmin ? (
        <Card className="p-3 sm:p-4">
          {latestRows.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No statements found
            </p>
          ) : (
            <>
              <DataTable
                mode="latest"
                tableCols={latestCols}
                tableRows={latestRows}
                handleDelete={handleDeleteStatement} // not used in latest mode
                onRowClick={(row) =>
                  router.push(`/dashboard/statements/${row.userId}`)
                }
              />
              <Separator className="my-3" />
              <Pagination
                page={table.page}
                total={table.total}
                totalPages={table.totalPages}
                onChange={(p) => table.setPage(p)}
                pageSize={table.pageSize}
                onPageSizeChange={(n) => {
                  table.setPage(1);
                  table.setPageSize(n);
                }}
              />
            </>
          )}
        </Card>
      ) : (
        <Card className="p-3 sm:p-4">
          <div className="p-1">
            {userLoading ? (
              <p className="text-center text-muted-foreground">Loading…</p>
            ) : userStatements.length === 0 ? (
              <p className="text-center text-muted-foreground">No statements</p>
            ) : (
              <DataTable
                mode="user"
                tableCols={detailsCols}
                tableRows={userStatements}
                handleDelete={handleDeleteStatement}
              />
            )}
            <Separator className="my-3" />
            <Pagination
              page={userPage}
              total={userTotal}
              totalPages={Math.max(1, Math.ceil(userTotal / userPageSize))}
              onChange={async (p) => {
                setUserPage(p);
                await fetchSelfStatements(
                  p,
                  userPageSize,
                  userSortField,
                  userSortOrder,
                  userSearch.trim()
                );
              }}
              pageSize={userPageSize}
              onPageSizeChange={async (n) => {
                setUserPageSize(n);
                setUserPage(1);
                await fetchSelfStatements(
                  1,
                  n,
                  userSortField,
                  userSortOrder,
                  userSearch.trim()
                );
              }}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default StatementsPage;
