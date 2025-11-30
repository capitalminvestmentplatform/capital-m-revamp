"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import React, { Fragment } from "react";
import { getLoggedInUser } from "@/utils/client";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";
import { EditKycDocsModal } from "@/app/components/modals/EditKycDocsModal";
import { usePathname } from "next/navigation";

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  handleDelete: (id: string) => Promise<boolean> | boolean;
  searchValue: string;
}

const DataTable: React.FC<DataTableProps> = ({
  tableCols,
  tableRows,
  handleDelete,
  searchValue,
}) => {
  const pathname = usePathname();
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;

  const normalizedSearch = searchValue.toLowerCase().trim();

  const filteredRows = tableRows?.filter((row) => {
    const titleMatch = row.subject?.toLowerCase().includes(normalizedSearch);
    const clientCodeMatch = row.clientCode
      ?.toLowerCase()
      .includes(normalizedSearch);
    return titleMatch || clientCodeMatch;
  });

  if (filteredRows.length === 0) {
    return <p className="text-center text-gray-500">No matching results</p>;
  }

  return (
    <Table
      style={{
        fontSize: "13px",
        whiteSpace: "nowrap",
        width: "max-content",
        minWidth: "100%",
      }}
    >
      <TableHeader>
        <TableRow>
          {tableCols.map((col, index) => (
            <TableHead key={index}>{col}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredRows.map((row, index) => (
          <TableRow key={index}>
            <TableCell>
              <Link
                href={`${pathname}/${row._id}`}
                className="text-blue-500 hover:underline"
              >
                {row.subject ? row.subject : "-"}
              </Link>
            </TableCell>
            <TableCell>{row.category ? row.category : "-"}</TableCell>
            <TableCell>{row.investment ? row.investment : "-"}</TableCell>

            <TableCell className="">
              <div className="flex gap-2">
                {role === "Admin" && (
                  <>
                    <ConfirmModal
                      title="Delete Newsletter?"
                      description="Are you sure you want to delete this newsletter? This action cannot be undone."
                      onConfirm={() => handleDelete(row._id)}
                    >
                      <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                        <Trash size={16} className="text-red-600" />
                      </button>
                    </ConfirmModal>
                    <Link
                      href={`${pathname}/${row._id}/edit`}
                      className="bg-white/80 p-1 rounded hover:bg-green-200"
                    >
                      <Pencil size={16} className="text-primaryBG" />
                    </Link>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;
