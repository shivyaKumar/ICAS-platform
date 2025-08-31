"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, UserPlus } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  division: string;
  role: "Admin" | "Staff";
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // form state
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    division: "",
    role: "Staff" as "Admin" | "Staff",
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    division?: string;
    role?: string;
  }>({});

  const apiBase = process.env.NEXT_PUBLIC_API_BASE?.trim();
  const divisions = ["Finance", "HR", "IT", "Operations"];

  // lock page scroll while form is open
  useEffect(() => {
    if (!showAddForm) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showAddForm]);

  // close on Esc
  useEffect(() => {
    if (!showAddForm) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowAddForm(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddForm]);

  // helpers
  const emailExists = useMemo(
    () => users.some((u) => u.email.toLowerCase().trim() === newUser.email.toLowerCase().trim()),
    [users, newUser.email]
  );

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function validate(): boolean {
    const e: typeof errors = {};
    if (!newUser.firstName.trim()) e.firstName = "First name is required.";
    if (!newUser.lastName.trim()) e.lastName = "Last name is required.";
    if (!newUser.email.trim()) e.email = "Email is required.";
    else if (!isEmailValid(newUser.email)) e.email = "Enter a valid email.";
    else if (emailExists) e.email = "This email is already in use.";
    if (!newUser.division) e.division = "Division is required.";
    if (!newUser.role) e.role = "Role is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // actions
  const handleAddUser = async () => {
    if (!validate() || isSaving) return;
    setIsSaving(true);

    const tempPassword = crypto.randomUUID().slice(0, 12);

    try {
      if (apiBase) {
        const res = await fetch(`${apiBase}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: newUser.firstName.trim(),
            lastName: newUser.lastName.trim(),
            email: newUser.email.trim(),
            division: newUser.division,
            role: newUser.role,
            tempPassword,
          }),
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || "Failed to create user");
        }
      }

      const id = crypto.randomUUID();
      setUsers((prev) => [
        {
          id,
          firstName: newUser.firstName.trim(),
          lastName: newUser.lastName.trim(),
          email: newUser.email.trim(),
          division: newUser.division,
          role: newUser.role,
        },
        ...prev,
      ]);

      setNewUser({ firstName: "", lastName: "", email: "", division: "", role: "Staff" });
      setErrors({});
      setShowAddForm(false);

      alert(
        apiBase
          ? "User created. A temporary password has been emailed."
          : "User saved locally. Backend will email credentials when connected."
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setIsSaving(false);
    }
  };

  const canSave =
    !!newUser.firstName.trim() &&
    !!newUser.lastName.trim() &&
    !!newUser.email.trim() &&
    isEmailValid(newUser.email) &&
    !emailExists &&
    !!newUser.division &&
    !!newUser.role;

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 space-y-6 min-w-0">
      {/* Header (responsive stack) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">User Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* full width on mobile, compact on larger screens */}
        <Button
          variant="primary"
          size="sm"
          className="w-full sm:w-32 md:w-40"
          onClick={() => setShowAddForm(true)}
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Floating centered form (no overlay) */}
      {showAddForm && (
        <div
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,42rem)]"
          role="dialog"
          aria-modal="true"
        >
          <Card className="relative rounded-2xl shadow-2xl border">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl leading-none"
              aria-label="Close add user form"
              onClick={() => setShowAddForm(false)}
            >
              ×
            </button>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl">Add New User</CardTitle>
              <p className="text-xs text-muted-foreground">All fields are required.</p>
            </CardHeader>

            <CardContent className="space-y-4 p-5 md:p-6 max-h-[75vh] overflow-y-auto">
              <div>
                <Label className="text-sm md:text-base">First Name</Label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <Label className="text-sm md:text-base">Last Name</Label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <Label className="text-sm md:text-base">Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label className="text-sm md:text-base">Division</Label>
                <Select
                  value={newUser.division}
                  onValueChange={(value) => setNewUser({ ...newUser, division: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.division && <p className="text-xs text-red-600 mt-1">{errors.division}</p>}
              </div>

              <div>
                <Label className="text-sm md:text-base">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as "Admin" | "Staff" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-xs text-red-600 mt-1">{errors.role}</p>}
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={handleAddUser}
                  disabled={!canSave || isSaving}
                >
                  {isSaving ? "Saving..." : "Save User"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 min-w-0">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold truncate">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.division} • {user.role}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <p className="text-muted-foreground text-sm md:text-base">No users yet.</p>
        )}
      </div>
    </div>
  );
}
