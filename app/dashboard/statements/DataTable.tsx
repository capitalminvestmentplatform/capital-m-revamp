"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "lucide-react";
import Link from "next/link";
import React from "react";
import { getLoggedInUser } from "@/utils/client";
import { ConfirmModal } from "@/app/components/modals/ConfirmModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BaseProps {
  tableCols: string[];
  tableRows: Record<string, any>[];
  handleDelete: (id: string) => Promise<boolean> | boolean;
  onRowClick?: (row: any) => void; // used in latest mode
}

type Mode = "latest" | "user";

interface DataTableProps extends BaseProps {
  mode: Mode;
}

const DataTable: React.FC<DataTableProps> = ({
  mode,
  tableCols,
  tableRows,
  handleDelete,
  onRowClick,
}) => {
  const loggedInUser = getLoggedInUser();
  const isAdmin = loggedInUser?.role === "Admin";

  if (!tableRows || tableRows.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No matching results</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="text-sm">
        <TableHeader>
          <TableRow>
            {tableCols.map((col, index) => (
              <TableHead key={index}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableRows.map((row, index) => {
            const clickable = mode === "latest" && !!onRowClick;
            return (
              <TableRow
                key={index}
                className={clickable ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => {
                  if (clickable) onRowClick?.(row);
                }}
              >
                {mode === "latest" ? (
                  <>
                    {isAdmin && (
                      <TableCell className="max-w-[280px]">
                        {row.username ? `${row.username}` : "-"}
                        {row.email ? (
                          <span className="text-xs text-muted-foreground">
                            {" "}
                            ({row.email})
                          </span>
                        ) : null}
                      </TableCell>
                    )}
                    <TableCell>{row.clientCode || "-"}</TableCell>
                    <TableCell>{row.latestMonth || "-"}</TableCell>
                    <TableCell>{row.latestYear ?? "-"}</TableCell>
                    <TableCell>{row.statementsCount ?? "-"}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {row.latestPdf ? (
                        <Link
                          href={row.latestPdf}
                          target="_blank"
                          className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md"
                        >
                          Preview
                        </Link>
                      ) : (
                        <Badge variant="destructive">Not found</Badge>
                      )}
                    </TableCell>
                  </>
                ) : (
                  // mode === "user"
                  <>
                    <TableCell>{row.month ?? "-"}</TableCell>
                    <TableCell>{row.year ?? "-"}</TableCell>
                    <TableCell>
                      {row.pdf ? (
                        <Link
                          href={row.pdf}
                          target="_blank"
                          className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md"
                        >
                          Preview
                        </Link>
                      ) : (
                        <Badge variant="destructive">Not found</Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <ConfirmModal
                          title="Delete Statement?"
                          description="Are you sure you want to delete this statement? This action cannot be undone."
                          onConfirm={() => handleDelete(row._id)}
                        >
                          <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                            <Trash size={16} className="text-red-600" />
                          </button>
                        </ConfirmModal>
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
