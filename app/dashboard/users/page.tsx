"use client";
import DataTable from "./DataTable";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import Pagination from "@/app/components/Pagination";
import SearchBar from "@/app/components/SearchBar";
import { useServerTable } from "@/hooks/useServerTable";

const DEFAULT_LIMIT = 10;

const UsersPage = () => {
  const pathname = usePathname();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Compose table state & helpers
  const table = useServerTable<any>({
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
      if (search) params.set("search", search);

      const res = await fetch(`/api/users?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json();

      if (json.statusCode !== 200) {
        throw new Error(json.message || "Failed to fetch users");
      }

      const { users, pagination } = json.data;
      return { items: users, total: pagination.total };
    },
  });

  // 2) fetch when page/limit/search/sort change
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await table.fetchPage();
        setUsers(items);
      } catch (e) {
        setError((e as Error).message);
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [
    table.page,
    table.pageSize,
    table.search,
    table.sortField,
    table.sortOrder,
  ]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);

      // if last row on the page, go back a page when possible
      if (users.length === 1 && table.page > 1) {
        table.setPage(table.page - 1);
      } else {
        const items = await table.fetchPage();
        setUsers(items);
      }
    } catch (err) {
      setError((err as Error).message);
      return false as any;
    }
  };

  const sendEmail = async (user: Record<string, any>) => {
    try {
      const res = await fetch(`/api/send-email-to-user`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        }),
      });

      const response = await res.json();
      if (response.statusCode !== 200) {
        toast.error(response.message);
        throw new Error(response.message);
      }
      toast.success(response.message);
    } catch (err) {
      setError((err as Error).message);
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <div className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {/* Search box + buttons */}
        <SearchBar
          value={table.searchInput}
          onChange={table.setSearchInput}
          onSearch={() => {
            table.setPage(1);
            table.applySearch();
          }}
          sortField={table.sortField}
          onSortFieldChange={(f) => {
            table.setPage(1);
            table.setSortField(f);
          }}
          sortOrder={table.sortOrder}
          onSortOrderToggle={() => {
            table.setPage(1);
            table.toggleSortOrder();
          }}
          onReset={() => {
            table.resetAll();
          }}
          placeholder="Search by client code, first or last name"
        />

        {/* Add new user */}
        <Link
          href={`${pathname}/add`}
          className="bg-primaryBG hover:bg-primaryBG text-white px-5 py-2 rounded-md text-sm font-semibold"
        >
          Add new user
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500">No users available</p>
      ) : (
        <>
          <DataTable
            tableCols={[
              "Client code",
              "Name",
              "Email",
              "Phone",
              "Role",
              "Invite",
              "Actions",
            ]}
            tableRows={users}
            handleDelete={handleDelete}
            sendEmail={sendEmail}
          />

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
    </div>
  );
};

export default UsersPage;
