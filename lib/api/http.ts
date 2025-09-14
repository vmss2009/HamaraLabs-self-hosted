import { NextResponse } from "next/server";

export type ApiError = {
  error: string;
  code?: string;
  details?: unknown;
};

export function failure(
  error: string,
  status: number = 400,
  opts?: { code?: string; details?: unknown }
) {
  const payload: ApiError = {
    error,
    ...(opts?.code ? { code: opts.code } : {}),
    ...(opts?.details !== undefined ? { details: opts.details } : {}),
  };
  return NextResponse.json(payload, { status });
}

export function success<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}
