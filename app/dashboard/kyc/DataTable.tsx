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

interface DataTableProps {
  tableCols: string[]; // Array of column headers
  tableRows: Record<string, any>[]; // Array of objects with dynamic keys
  handleDelete: (id: string, type: string) => Promise<boolean> | boolean;
  handleEdit: (userId: string, id: string, data: any) => Promise<boolean>;
}

const DataTable: React.FC<DataTableProps> = ({
  tableCols,
  tableRows,
  handleDelete,
  handleEdit,
}) => {
  const loggedInUser = getLoggedInUser();
  const role = loggedInUser ? loggedInUser.role : null;
  if (tableRows.length === 0) {
    return <p className="text-center text-gray-500">No data available</p>;
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
        {tableRows.map((row, index) => (
          <TableRow key={index}>
            {role === "Admin" && (
              <TableCell>
                {row.clientCode ? `${row.clientCode} ${row.username}` : "-"}
              </TableCell>
            )}
            <TableCell>
              {row.nationalId ? (
                <div className="flex gap-5">
                  <Link
                    href={row.nationalId}
                    target="_blank"
                    className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md"
                  >
                    Preview
                  </Link>
                  {role === "Admin" && (
                    <>
                      <p>|</p>
                      <div className="flex gap-3">
                        <ConfirmModal
                          title="Delete KYC?"
                          description="Are you sure you want to delete National Id? This action cannot be undone."
                          onConfirm={() => handleDelete(row._id, "nationalId")}
                        >
                          <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                            <Trash size={16} className="text-red-600" />
                          </button>
                        </ConfirmModal>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-xs bg-red-200 text-red-600 px-3 py-1 rounded-md w-fit">
                  Not found
                </div>
              )}
            </TableCell>
            <TableCell>
              {row.nationalPassport ? (
                <div className="flex gap-5">
                  <Link
                    href={row.nationalPassport}
                    target="_blank"
                    className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md"
                  >
                    Preview
                  </Link>
                  {role === "Admin" && (
                    <>
                      <p>|</p>
                      <div className="flex">
                        <ConfirmModal
                          title="Delete KYC?"
                          description="Are you sure you want to delete National Passport? This action cannot be undone."
                          onConfirm={() =>
                            handleDelete(row._id, "nationalPassport")
                          }
                        >
                          <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                            <Trash size={16} className="text-red-600" />
                          </button>
                        </ConfirmModal>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-xs bg-red-200 text-red-600 px-3 py-1 rounded-md w-fit">
                  Not found
                </div>
              )}
            </TableCell>

            <TableCell>
              {row.residenceProof ? (
                <div className="flex gap-5">
                  <Link
                    href={row.residenceProof}
                    target="_blank"
                    className="text-xs bg-green-200 text-green-600 px-3 py-1 rounded-md"
                  >
                    Preview
                  </Link>

                  {role === "Admin" && (
                    <>
                      <p>|</p>
                      <div className="flex gap-3">
                        <ConfirmModal
                          title="Delete KYC?"
                          description="Are you sure you want to delete Proof of Residence? This action cannot be undone."
                          onConfirm={() =>
                            handleDelete(row._id, "residenceProof")
                          }
                        >
                          <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                            <Trash size={16} className="text-red-600" />
                          </button>
                        </ConfirmModal>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-xs bg-red-200 text-red-600 px-3 py-1 rounded-md w-fit">
                  Not found
                </div>
              )}
            </TableCell>
            <TableCell className="">
              <div className="flex gap-2">
                {role === "Admin" && (
                  <>
                    <ConfirmModal
                      title="Delete KYC?"
                      description="Are you sure you want to delete kyc docs of this user? This action cannot be undone."
                      onConfirm={() => handleDelete(row._id, "all")}
                    >
                      <button className="bg-white/80 p-1 rounded hover:bg-red-200">
                        <Trash size={16} className="text-red-600" />
                      </button>
                    </ConfirmModal>
                    <EditKycDocsModal
                      kycData={{
                        _id: row._id,
                        nationalId: row.nationalId,
                        nationalPassport: row.nationalPassport,
                        residenceProof: row.residenceProof,
                      }}
                      onSubmit={(data) => handleEdit(row.userId, row._id, data)}
                    />
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
