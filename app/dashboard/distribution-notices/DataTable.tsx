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
import React from "react";
import { getLoggedInUser } from "@/utils/client";
import MessageModal from "../../components/modals/MessageModal";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";
import { EditDistributionNoticeModal } from "@/app/components/modals/EditDistributionModal";

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  handleDelete: (id: string) => Promise<boolean> | boolean;
  handleEdit: (id: string, data: any) => Promise<boolean>;
  searchValue: string;
}

const DataTable: React.FC<DataTableProps> = ({
  tableCols,
  tableRows,
  handleDelete,
  handleEdit,
  searchValue,
}) => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;

  const normalizedSearch = searchValue.toLowerCase().trim();

  const filteredRows = tableRows?.filter((row) => {
    const titleMatch = row.commitmentName
      ?.toLowerCase()
      .includes(normalizedSearch);
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
            {/* <TableCell>
              {row.commitmentName ? row.commitmentName : "-"}
            </TableCell> */}
            {role === "Admin" && (
              <TableCell>
                {row.clientCode ? `${row.clientCode} ${row.username}` : "-"}
              </TableCell>
            )}
            <TableCell>
              {row.distributionAmount
                ? `AED ${row.distributionAmount.toLocaleString()}`
                : "-"}
            </TableCell>

            <TableCell>
              {new Date(row.distributionDate).toLocaleString("en-US", {
                hour12: true,
                hour: "numeric",
                minute: "2-digit",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </TableCell>

            <TableCell>
              {row.description ? (
                <MessageModal message={row.description} />
              ) : (
                "-"
              )}
            </TableCell>

            <TableCell>
              {row.pdf ? (
                <Link
                  href={row?.pdf}
                  target="_blank"
                  className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md"
                >
                  Download
                </Link>
              ) : (
                "-"
              )}
            </TableCell>

            <TableCell className="">
              <div className="flex gap-2">
                {role === "Admin" && (
                  <>
                    <ConfirmModal
                      title="Delete Distribution Notice?"
                      description="Are you sure you want to delete this distribution notice? This action cannot be undone."
                      onConfirm={() => handleDelete(row._id)}
                    >
                      <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                        <Trash size={16} className="text-red-600" />
                      </button>
                    </ConfirmModal>
                    {/* <EditDistributionNoticeModal
                      distribution={{
                        _id: row._id,
                        userId: row.userId,
                        username: row.username,
                        commitmentName: row.commitmentName,
                        distributionAmount: row.distributionAmount.toString(),
                        distributionDate: row.distributionDate?.split("T")[0], // ensure YYYY-MM-DD
                        description: row.description,
                        pdf: row.pdf,
                      }}
                      onSubmit={handleEdit}
                    /> */}
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
