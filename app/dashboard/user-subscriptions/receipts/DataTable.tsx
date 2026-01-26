"use client";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { Fragment, useState } from "react";
import { getLoggedInUser } from "@/utils/client";
import Image from "next/image";
import CustomButton from "../../../components/Button";
import MessageModal from "../../../components/modals/MessageModal";
import { EditCommitmentModal } from "../../../components/modals/EditCommitmentModal";
import { ConfirmModal } from "../../../components/modals/ConfirmModal";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  handleDelete: (id: string) => Promise<boolean> | boolean;
  uploadReceipt: (
    row: any,
    file: File,
    index: number
  ) => Promise<boolean> | boolean;
  uploadReceiptLoadingIndex: number;
  searchValue: string;
}

const DataTable: React.FC<DataTableProps> = ({
  tableCols,
  tableRows,
  handleDelete,
  uploadReceipt,
  uploadReceiptLoadingIndex,
  searchValue,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (data: any, index: number) => {
    if (!selectedFile) return;
    const success = uploadReceipt(data, selectedFile, index);

    if (success) {
      setOpen(false);
    }
  };

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
            {row.productId ? (
              <Fragment>
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
              </Fragment>
            ) : (
              <Fragment>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </Fragment>
            )}
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
              {row.pdf ? (
                <Link
                  href={row?.pdf}
                  target="_blank"
                  className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md"
                >
                  Download
                </Link>
              ) : (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      className="bg-primaryBG hover:bg-primaryBG text-white text-xs px-3 py-1 font-normal h-6 rounded-md"
                    >
                      Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Receipt</DialogTitle>
                    </DialogHeader>
                    <Input type="file" onChange={handleFileChange} />
                    <div className="flex justify-end mt-4">
                      <Button
                        className="bg-primaryBG hover:bg-primaryBG text-white text-xs px-4 py-1 rounded-md"
                        disabled={!selectedFile}
                        onClick={() => handleUpload(row, index)}
                      >
                        {uploadReceiptLoadingIndex === index
                          ? "Uploading..."
                          : "Upload"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </TableCell>
            <TableCell>
              {row.status === "Created" ? (
                <div className="text-xs bg-red-200 text-red-600 px-3 py-1 rounded-md w-fit">
                  {row.status}
                </div>
              ) : row.status === "In Progress" ? (
                <div className="text-xs bg-orange-200 text-orange-600 px-3 py-1 rounded-md w-fit">
                  {row.status}
                </div>
              ) : row.status === "Completed" ? (
                <div className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md w-fit">
                  {row.status}
                </div>
              ) : (
                <div>-</div>
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
            </TableCell>

            <TableCell className="">
              <div className="flex gap-2">
                {role === "Admin" ? (
                  <>
                    {/* <ConfirmModal
                      title="Delete Capital Call?"
                      description="Are you sure you want to delete this capital call? This action cannot be undone."
                      onConfirm={() => handleDelete(row._id)}
                    >
                      <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                        <Trash size={16} className="text-red-600" />
                      </button>
                    </ConfirmModal> */}
                    <Link
                      href={`/dashboard/user-subscriptions/receipts/${row._id}`}
                      className="bg-white/80 p-1 rounded hover:bg-green-200"
                    >
                      <Pencil size={16} className="text-primaryBG" />
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/dashboard/user-subscriptions/receipts/${row._id}`}
                    className="bg-white/80 p-1 rounded hover:bg-green-200"
                  >
                    <Pencil size={16} className="text-primaryBG" />
                  </Link>
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
