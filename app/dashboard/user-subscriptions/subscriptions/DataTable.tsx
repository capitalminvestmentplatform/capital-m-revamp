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
import CustomButton from "../../../components/Button";
import MessageModal from "../../../components/modals/MessageModal";
import { EditCommitmentModal } from "../../../components/modals/EditCommitmentModal";
import { ConfirmModal } from "../../../components/modals/ConfirmModal";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import PreviewSign from "./PreviewSign";

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  handleDelete: (id: string) => Promise<boolean> | boolean;
  handleAccept: (id: string, index: number) => void;
  createCapitalCall: (id: string, index: number) => void;
  acceptLoadingIndex: number;
  capitalLoadingIndex: number;
  searchValue: string;
}

const DataTable: React.FC<DataTableProps> = ({
  tableCols,
  tableRows,
  createCapitalCall,
  capitalLoadingIndex,
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
              {row.sign ? (
                <PreviewSign url={row.sign} />
              ) : (
                <div className="text-xs bg-red-200 text-red-600 px-3 py-1 rounded-md w-fit">
                  Not found
                </div>
              )}
            </TableCell>
            <TableCell>
              {row.signedSubscription ? (
                <Link
                  href={row.signedSubscription}
                  target="_blank"
                  className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md"
                >
                  Download
                </Link>
              ) : (
                <div className="text-xs bg-red-200 text-red-600 px-3 py-1 rounded-md w-fit">
                  Not found
                </div>
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
            </TableCell>
            {role === "Admin" && (
              <>
                <TableCell>
                  {row.capitalCall ? (
                    <Button
                      className={`bg-green-200 text-green-600 font-normal text-xs px-2 py-1 rounded-md h-7`}
                      type="button"
                      disabled
                    >
                      Created
                    </Button>
                  ) : (
                    <Button
                      className={`${
                        capitalLoadingIndex === index || !row.signedSubscription
                          ? "bg-gray-300 text-gray-500"
                          : "bg-primaryBG hover:bg-primaryBG text-white"
                      } font-normal text-xs px-2 py-1 rounded-md h-7`}
                      type="button"
                      disabled={
                        capitalLoadingIndex === index || !row.signedSubscription
                      }
                      onClick={() => createCapitalCall(row._id, index)}
                    >
                      {capitalLoadingIndex === index ? "Creating" : "Create"}
                    </Button>
                  )}
                </TableCell>
              </>
            )}
            <TableCell className="">
              <div className="flex gap-2">
                {role === "Admin" ? (
                  <>
                    <Link
                      href={`/dashboard/user-subscriptions/subscriptions/${row._id}`}
                      className="bg-white/80 p-1 rounded hover:bg-green-200"
                    >
                      <Pencil size={16} className="text-primaryBG" />
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/dashboard/user-subscriptions/subscriptions/${row._id}`}
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
