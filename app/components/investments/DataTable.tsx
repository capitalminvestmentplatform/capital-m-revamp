import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

import React from "react";
import { getLoggedInUser } from "@/utils/client";
import { ConfirmModal } from "../modals/ConfirmModal";
import Image from "next/image";

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  handleDelete: (userId: string) => Promise<boolean>;
}

const DataTable: React.FC<DataTableProps> = ({
  tableCols,
  tableRows,
  handleDelete,
}) => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  if (tableRows.length === 0) {
    return <p className="text-center text-gray-500">No data available</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {tableCols.map((col, index) => (
            <TableHead key={index}>{col}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableRows.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.productId ? row.productId : "-"}</TableCell>
            <TableCell>
              <Link
                href={`/dashboard/investments/${row._id}`}
                className="text-blue-500 hover:underline"
              >
                {row.title ? row.title : "-"}
              </Link>
            </TableCell>
            <TableCell className="relative">
              {row.featuredImage ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={row.featuredImage}
                    alt="thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  style={{ width: "50px", height: "50px" }}
                  className="rounded-full border-2"
                />
              )}
            </TableCell>
            <TableCell>{row.category ? row.category : "-"}</TableCell>
            <TableCell>
              {row.expectedValue
                ? `AED ${row.expectedValue.toLocaleString()}`
                : "-"}
            </TableCell>
            <TableCell className="capitalize">
              {row.investmentDuration ? `${row.investmentDuration} years` : "-"}
            </TableCell>
            <TableCell>{row.status ? "Active" : "InActive"}</TableCell>
            <TableCell className="flex gap-2">
              {role === "Admin" && (
                <>
                  <ConfirmModal
                    title="Delete Investment?"
                    description="Are you sure you want to delete this investment? This action cannot be undone."
                    onConfirm={() => handleDelete(row._id)}
                  >
                    <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                      <Trash size={16} className="text-red-600" />
                    </button>
                  </ConfirmModal>
                  <Link
                    href={`/dashboard/investments/${row._id}/edit`}
                    className="bg-white/80 p-1 rounded hover:bg-green-200"
                  >
                    <Pencil size={16} className="text-primaryBG" />
                  </Link>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;
