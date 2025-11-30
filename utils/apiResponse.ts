import { NextResponse } from "next/server";

type SuccessResponse<T = any> = {
  statusCode: number;
  message: string;
  data?: T;
};

type ErrorResponse = {
  statusCode: number;
  message: string;
  error?: any;
};

const toPlainObject = (doc: any) => {
  if (doc?.toObject) return doc.toObject(); // Convert Mongoose doc to plain JS object
  return doc;
};

const removeVersionKey = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map((item) => removeVersionKey(toPlainObject(item)));
  } else if (data && typeof data === "object") {
    const plain = toPlainObject(data);
    const { __v, ...rest } = plain;
    return rest;
  }
  return data;
};

export const sendSuccessResponse = <T>(
  statusCode: number,
  message: string,
  data?: T
) => {
  const response: SuccessResponse<T> = { statusCode, message };
  if (data !== undefined) {
    const cleanedData = removeVersionKey(data);
    response.data = cleanedData;
  }
  return NextResponse.json(response, { status: statusCode });
};

export const sendErrorResponse = (
  statusCode: number,
  message: string,
  error?: any
) => {
  const response: ErrorResponse = { statusCode, message };
  if (error !== undefined) {
    response.error = error;
  }
  return NextResponse.json(response, { status: statusCode });
};
