import { Request } from 'express';

// JWT Payload type
export interface JwtPayload {
  sub: string; // User ID (MongoDB ObjectId as string)
  username: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// API Response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// User DTO
export interface UserDto {
  id: string;
  username: string;
  createdAt: Date;
}

// Auth DTOs
export interface LoginResponseDto {
  user: UserDto;
  accessToken: string;
}

// Document DTOs
export interface DocumentDto {
  id: string;
  documentType: string;
  status: string;
  fileName: string;
  hasResult: boolean;
  verificationResult?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface DocumentSummaryDto {
  total: number;
  uploaded: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface DocumentListResponseDto {
  documents: DocumentDto[];
  summary: DocumentSummaryDto;
}

export interface DocumentResultDto {
  id: string;
  documentType: string;
  status: string;
  fileName: string;
  hasResult: boolean;
  verificationResult?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface PollUpdateDto {
  id: string;
  documentType: string;
  status: string;
  hasResult: boolean;
}

export interface PollResponseDto {
  updates: PollUpdateDto[];
}
