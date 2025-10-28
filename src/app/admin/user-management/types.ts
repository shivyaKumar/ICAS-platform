"use client";

export interface Division {
  id: number;
  name: string;
  description?: string;
}

export interface Branch {
  id: number;
  name: string;
  location: string;
  divisionId: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  branchId: number;
  divisionId: number;
  role: string;
}

export interface Role {
  id: number;
  name: string;
}

export type ConfirmConfig = {
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
};
