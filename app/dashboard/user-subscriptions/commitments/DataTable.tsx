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
import Image from "next/image";
import MessageModal from "../../../components/modals/MessageModal";
import { EditCommitmentModal } from "../../../components/modals/EditCommitmentModal";
import { ConfirmModal } from "../../../components/modals/ConfirmModal";
import { Button } from "@/components/ui/button";

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  handleDelete: (userId: string) => Promise<boolean>;
  handleEdit: (updatedData: any) => Promise<boolean>;
  createSubscription: (updatedData: any, index: number) => Promise<boolean>;
  initiateLoadingIndex?: number;
  searchValue: string;
}

const DataTable: React.FC<DataTableProps> = ({
  tableCols,
  tableRows,
  handleDelete,
  handleEdit,
  createSubscription,
  initiateLoadingIndex,
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
              {row.commitmentAmount
                ? `AED ${row.commitmentAmount.toLocaleString()}`
                : "-"}
            </TableCell>
            <TableCell>
              {row.message ? <MessageModal message={row.message} /> : "-"}
            </TableCell>
            {role === "Admin" && (
              <TableCell>
                {row.status !== "Pending" ? (
                  <Button
                    className={`bg-green-200 text-green-600 font-normal text-xs px-2 py-1 rounded-md h-7`}
                    type="button"
                    disabled
                  >
                    Initiated
                  </Button>
                ) : (
                  <Button
                    className={`text-white ${initiateLoadingIndex === index ? "bg-gray-300 text-gray-500" : "bg-primaryBG hover:bg-primaryBG "}  font-normal text-xs px-2 py-1 rounded-md h-7`}
                    type="button"
                    disabled={initiateLoadingIndex === index}
                    onClick={() => createSubscription(row._id, index)}
                  >
                    {initiateLoadingIndex === index ? `Initiating` : "Initiate"}
                  </Button>
                )}
              </TableCell>
            )}
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
            <TableCell className="">
              <div className="flex gap-2">
                {role === "Admin" && (
                  <>
                    <EditCommitmentModal
                      defaultValues={{
                        _id: row._id,
                        phone: row.phone,
                        commitmentAmount: row.commitmentAmount.toString(),
                        message: row.message,
                      }}
                      onUpdate={async (data) => {
                        const result = await handleEdit(data);
                        return result;
                      }}
                    />
                    <ConfirmModal
                      title="Delete Commitment?"
                      description="Are you sure you want to delete this commitment? This action cannot be undone."
                      onConfirm={() => handleDelete(row._id)}
                    >
                      <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                        <Trash size={16} className="text-red-600" />
                      </button>
                    </ConfirmModal>
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
