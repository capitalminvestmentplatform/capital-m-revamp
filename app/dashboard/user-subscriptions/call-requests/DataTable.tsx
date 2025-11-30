import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import React from "react";
import { getLoggedInUser } from "@/utils/client";
import Image from "next/image";
import MessageModal from "../../../components/modals/MessageModal";

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  searchValue: string;
}

const DataTable: React.FC<DataTableProps> = ({
  tableCols,
  tableRows,
  searchValue,
}) => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;

  const normalizedSearch = searchValue.toLowerCase().trim();

  const filteredRows = tableRows?.filter((row) => {
    const titleMatch = row.title?.toLowerCase().includes(normalizedSearch);
    const clientCodeMatch = row.clientCode
      ?.toLowerCase()
      .includes(normalizedSearch);
    return titleMatch || clientCodeMatch;
  });

  if (filteredRows.length === 0) {
    return <p className="text-center text-gray-500">No matching results</p>;
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
        {filteredRows.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{row.productId ? row.productId : "-"}</TableCell>
            <TableCell>{row.title ? row.title : "-"}</TableCell>
            <TableCell className="relative">
              {row.thumbnail ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={row.thumbnail}
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
            {role === "Admin" && (
              <TableCell>
                {row.clientCode ? `${row.clientCode} ${row.username}` : "-"}
              </TableCell>
            )}
            <TableCell>
              {row.message ? <MessageModal message={row.message} /> : "-"}
            </TableCell>
            <TableCell>
              {row.status === "Pending" ? (
                <div className="text-xs bg-red-200 text-red-600 px-3 py-1 rounded-md w-fit">
                  {row.status}
                </div>
              ) : row.status === "In Progress" ? (
                <div className="text-xs bg-orange-200 text-orange-600 px-3 py-1 rounded-md w-fit">
                  {row.status}
                </div>
              ) : (
                <div className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md w-fit">
                  {row.status}
                </div>
              )}
            </TableCell>
            <TableCell>
              {new Date(row.createdAt).toLocaleString("en-US", {
                hour12: true,
                hour: "numeric",
                minute: "2-digit",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </TableCell>{" "}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DataTable;
