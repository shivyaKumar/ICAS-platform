"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Layers, Building2, Users, UserPlus } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { DivisionHierarchy } from "./DivisionHierarchy";
import { DivisionTable } from "./DivisionTable";
import { BranchTable } from "./BranchTable";
import { UserTable } from "./UserTable";
import { SimpleModal } from "./SimpleModal";
import type { Branch, Division, Role, User, ConfirmConfig } from "./types";

/* ============================================================
   USER MANAGEMENT PAGE — CLEAN, PRODUCTION-READY VERSION
   ============================================================ */
export default function UserManagementPage() {
  const { toast } = useToast();

  /* ---------- State ---------- */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentRole, setCurrentRole] = useState<string>("");

  const [showAddBranch, setShowAddBranch] = useState(false);
  const [showAddDivision, setShowAddDivision] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [editingDivisionId, setEditingDivisionId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [newBranch, setNewBranch] = useState({ name: "", location: "", divisionId: 0 });
  const [newDivision, setNewDivision] = useState({ name: "", description: "" });
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    divisionId: 0,
    branchId: 0,
    role: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  /* ---------- Lookup Maps ---------- */
  const branchLookup = useMemo(() => new Map(branches.map(b => [b.id, b])), [branches]);
  const divisionLookup = useMemo(() => new Map(divisions.map(d => [d.id, d])), [divisions]);

  const branchesByDivision = useMemo(() => {
    const map = new Map<number, Branch[]>();
    branches.forEach(b => {
      const arr = map.get(b.divisionId) ?? [];
      arr.push(b);
      map.set(b.divisionId, arr);
    });
    return map;
  }, [branches]);

  const branchCountByDivision = useMemo(() => {
    const map = new Map<number, number>();
    branches.forEach(b => map.set(b.divisionId, (map.get(b.divisionId) ?? 0) + 1));
    return map;
  }, [branches]);

  const userCountByBranch = useMemo(() => {
    const map = new Map<number, number>();
    users.forEach(u => map.set(u.branchId, (map.get(u.branchId) ?? 0) + 1));
    return map;
  }, [users]);

  /* ---------- Helpers ---------- */
  const formatBranchLabel = (branch?: Branch | null) =>
    branch ? (branch.location ? `${branch.name} - ${branch.location}` : branch.name) : "Branch not linked";

  /* ---------- Fetch All Data ---------- */
  const reloadAll = useCallback(async () => {
    try {
      const [bRes, dRes, uRes, rRes, meRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/divisions"),
        fetch("/api/users"),
        fetch("/api/roles"),
        fetch("/api/me", { credentials: "include" }),
      ]);

      if (![bRes, dRes, uRes, rRes, meRes].every(r => r.ok))
        throw new Error("Failed to reload data");

      const [b, d, u, r, me] = await Promise.all([
        bRes.json(),
        dRes.json(),
        uRes.json(),
        rRes.json(),
        meRes.json(),
      ]);

      let filteredRoles = r;
      const roleFromApi =
        Array.isArray(me.roles) && me.roles.length > 0 ? me.roles[0] : me.role || "";

      if (roleFromApi === "IT Admin")
        filteredRoles = r.filter((x: Role) => x.name !== "IT Admin");
      else if (roleFromApi === "Admin")
        filteredRoles = r.filter((x: Role) => x.name === "Standard User");

      setBranches(b);
      setDivisions(d);
      setUsers(u.filter((user: User) => user.role !== "Super Admin"));
      setRoles(filteredRoles);
      setCurrentRole(roleFromApi);
    } catch (err) {
      console.error("Reload error:", err);
      toast({
        title: "Unable to Refresh Data",
        description: err instanceof Error ? err.message : "Unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  /* ---------- Permissions ---------- */
  const canManageDivisions = currentRole === "Super Admin" || currentRole === "IT Admin";
  const canManageUsers = currentRole !== "Staff";

  /* ---------- Reset Helpers ---------- */
  const resetBranch = () => setNewBranch({ name: "", location: "", divisionId: 0 });
  const resetDivision = () => setNewDivision({ name: "", description: "" });
  const resetUser = () =>
    setNewUser({ firstName: "", lastName: "", email: "", divisionId: 0, branchId: 0, role: "" });

  /* ---------- Dialog Control ---------- */
  const closeAllDialogs = () => {
    setShowAddBranch(false);
    setShowAddDivision(false);
    setShowAddUser(false);
    setEditingBranchId(null);
    setEditingDivisionId(null);
    setEditingUserId(null);
    resetBranch();
    resetDivision();
    resetUser();
  };

  /* ---------- Branch Handlers ---------- */
  const handleSaveBranch = async () => {
    if (!newBranch.name.trim() || !newBranch.location.trim() || !newBranch.divisionId) {
      toast({
        title: "Missing Details",
        description: "Name, location, and division are required for a branch.",
        variant: "destructive",
      });
      return;
    }
    const method = editingBranchId ? "PUT" : "POST";
    const endpoint = editingBranchId
      ? `/api/branches/${editingBranchId}`
      : "/api/branches";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBranch),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({
        title: editingBranchId ? "Branch Updated" : "Branch Added",
        description: `${newBranch.name} saved successfully.`,
        variant: "success",
      });
      await reloadAll();
      closeAllDialogs();
    } catch (err) {
      toast({
        title: "Branch Save Failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBranch = (id: number) => {
    const branch = branchLookup.get(id);
    setConfirmConfig({
      title: "Delete Branch?",
      description: `This will remove ${branch?.name ?? "this branch"} and its users.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/branches/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(await res.text());
          toast({
            title: "Branch Deleted",
            description: `${branch?.name ?? "Branch"} removed successfully.`,
            variant: "success",
          });
          await reloadAll();
        } catch (err) {
          toast({
            title: "Delete Failed",
            description: err instanceof Error ? err.message : "Try again later.",
            variant: "destructive",
          });
        } finally {
          setConfirmOpen(false);
        }
      },
    });
    setConfirmOpen(true);
  };

  /* ---------- Division Handlers ---------- */
  const handleSaveDivision = async () => {
    if (!newDivision.name.trim()) {
      toast({
        title: "Division Name Required",
        description: "Please provide a name before saving.",
        variant: "destructive",
      });
      return;
    }

    const method = editingDivisionId ? "PUT" : "POST";
    const endpoint = editingDivisionId
      ? `/api/divisions/${editingDivisionId}`
      : "/api/divisions";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDivision),
      });
      if (!res.ok) throw new Error(await res.text());
      toast({
        title: editingDivisionId ? "Division Updated" : "Division Created",
        description: `${newDivision.name} saved successfully.`,
        variant: "success",
      });
      await reloadAll();
      closeAllDialogs();
    } catch (err) {
      toast({
        title: "Division Save Failed",
        description: err instanceof Error ? err.message : "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDivision = (id: number) => {
    const div = divisionLookup.get(id);
    setConfirmConfig({
      title: "Delete Division?",
      description: `This will remove ${div?.name ?? "the division"} and all linked branches/users.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/divisions/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(await res.text());
          toast({
            title: "Division Deleted",
            description: `${div?.name ?? "Division"} removed successfully.`,
            variant: "success",
          });
          await reloadAll();
        } catch (err) {
          toast({
            title: "Delete Failed",
            description: err instanceof Error ? err.message : "Try again later.",
            variant: "destructive",
          });
        } finally {
          setConfirmOpen(false);
        }
      },
    });
    setConfirmOpen(true);
  };

     /* ---------- User Handlers ---------- */
    const handleSaveUser = async () => {
      if (
        !newUser.firstName.trim() ||
        !newUser.lastName.trim() ||
        !newUser.email.trim() ||
        !newUser.branchId ||
        !newUser.role
      ) {
        toast({
          title: "Incomplete User Details",
          description: "All fields are required before saving.",
          variant: "destructive",
        });
        return;
      }

      const method = editingUserId ? "PUT" : "POST";
      const endpoint = editingUserId
        ? `/api/users/${editingUserId}`
        : "/api/users";

      try {
        const res = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
        if (!res.ok) throw new Error(await res.text());
        toast({
          title: editingUserId ? "User Updated" : "User Added",
          description: `${newUser.firstName} ${newUser.lastName} saved successfully.`,
          variant: "success",
        });
        await reloadAll();
        closeAllDialogs();
      } catch (err) {
        let message = "Please try again.";

        if (err instanceof Error) {
          try {
            const parsed = JSON.parse(err.message);

            // Detect duplicate email/username and show friendly message
            if (Array.isArray(parsed)) {
              const duplicateErrors = parsed.some(
                e => e.code === "DuplicateUserName" || e.code === "DuplicateEmail"
              );

              if (duplicateErrors) {
                message = "Email or username already exists.";
              } else {
                message = parsed.map(e => e.description || e.code).join(" | ");
              }
            } else if (parsed.description) {
              message = parsed.description;
            } else {
              message = err.message;
            }
          } catch {
            message = err.message;
          }
        }

        toast({
          title: "User Save Failed",
          description: message,
          variant: "destructive",
        });
      }

    };

    const handleDeleteUser = (id: number) => {
      const user = users.find(u => u.id === id);
      setConfirmConfig({
        title: "Delete User?",
        description: `This will permanently remove ${user?.firstName ?? "this user"}.`,
        onConfirm: async () => {
          try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(await res.text());
            toast({
              title: "User Deleted",
              description: `${user?.firstName ?? "User"} removed successfully.`,
              variant: "success",
            });
            await reloadAll();
          } catch (err) {
            toast({
              title: "Delete Failed",
              description: err instanceof Error ? err.message : "Please try again later.",
              variant: "destructive",
            });
          } finally {
            setConfirmOpen(false);
          }
        },
      });
      setConfirmOpen(true);
    };

    /* ---------- Edit Handlers ---------- */
    const handleEditDivision = (d: Division) => {
      setNewDivision({ name: d.name, description: d.description || "" });
      setEditingDivisionId(d.id);
      setShowAddDivision(true);
    };

    const handleEditBranch = (b: Branch) => {
      setNewBranch({ name: b.name, location: b.location, divisionId: b.divisionId });
      setEditingBranchId(b.id);
      setShowAddBranch(true);
    };

    const handleEditUser = (u: User) => {
      const branch = branches.find(b => b.id === u.branchId);
      setNewUser({
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        branchId: u.branchId,
        divisionId: branch ? branch.divisionId : u.divisionId,
        role: u.role,
      });
      setEditingUserId(u.id);
      setShowAddUser(true);
    };

    /* ---------- Stats & UI ---------- */
    const stats = [
      { icon: Layers, label: "Divisions", value: divisions.length, desc: "Active organisational divisions" },
      { icon: Building2, label: "Branches", value: branches.length, desc: "Branch locations under divisions" },
      { icon: Users, label: "Users", value: users.length, desc: "Total user accounts" },
    ];

    const actions: { key: string; icon: LucideIcon; label: string; onClick: () => void }[] = [];
    if (canManageDivisions) {
      actions.push(
        {
          key: "add-division",
          icon: Layers,
          label: "Add Division",
          onClick: () => {
            resetDivision();
            setEditingDivisionId(null);
            closeAllDialogs();
            setShowAddDivision(true);
          },
        },
        {
          key: "add-branch",
          icon: Building2,
          label: "Add Branch",
          onClick: () => {
            resetBranch();
            setEditingBranchId(null);
            closeAllDialogs();
            setShowAddBranch(true);
          },
        }
      );
    }
    if (canManageUsers) {
      actions.push({
        key: "add-user",
        icon: UserPlus,
        label: "Add User",
        onClick: () => {
          resetUser();
          setEditingUserId(null);
          closeAllDialogs();
          setShowAddUser(true);
        },
      });
    }

    /* ---------- MAIN UI ---------- */
    return (
      <div className="space-y-6">
        <ConfirmDialog
          open={confirmOpen}
          title={confirmConfig.title}
          description={confirmConfig.description}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmOpen(false)}
        />

        {/* --- Page Header & Summary --- */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold">User Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage divisions, branches, and user access across the organisation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.map(({ key, icon: Icon, label, onClick }) => (
                <Button key={key} size="sm" variant="primary" onClick={onClick}>
                  <Icon className="h-4 w-4" />
                  <span className="ml-2">{label}</span>
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map(s => (
              <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} description={s.desc} />
            ))}
          </CardContent>
        </Card>

        {/* --- Tabs Section --- */}
        <Tabs defaultValue="hierarchy" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="divisions">Divisions</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* --- Hierarchy --- */}
          <TabsContent value="hierarchy">
            <DivisionHierarchy
              divisions={divisions}
              branchesByDivision={branchesByDivision}
              userCountByBranch={userCountByBranch}
              EmptyState={EmptyState}
            />
          </TabsContent>

          {/* --- Divisions --- */}
          <TabsContent value="divisions">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Divisions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Overview of all configured divisions.
                </p>
              </CardHeader>
              <CardContent>
                {divisions.length ? (
                  <DivisionTable
                    divisions={divisions}
                    branchCounts={branchCountByDivision}
                    canManage={canManageDivisions}
                    onEdit={handleEditDivision}
                    onDelete={handleDeleteDivision}
                  />
                ) : (
                  <EmptyState message="No divisions created yet." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Branches --- */}
          <TabsContent value="branches">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Branches</CardTitle>
                <p className="text-sm text-muted-foreground">
                  List of branches under their respective divisions.
                </p>
              </CardHeader>
              <CardContent>
                {branches.length ? (
                  <BranchTable
                    branches={branches}
                    divisionLookup={divisionLookup}
                    userCountByBranch={userCountByBranch}
                    canManage={canManageDivisions}
                    onEdit={handleEditBranch}
                    onDelete={handleDeleteBranch}
                  />
                ) : (
                  <EmptyState message="No branches have been added yet." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- Users --- */}
          <TabsContent value="users">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage user accounts, roles, and branch assignments.
                </p>
              </CardHeader>
              <CardContent>
                {users.length ? (
                  <UserTable
                    users={users}
                    branchLookup={branchLookup}
                    divisionLookup={divisionLookup}
                    formatBranchLabel={formatBranchLabel}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                  />
                ) : (
                  <EmptyState message="No users available. Add a user to populate this list." />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ---------- MODALS ---------- */}
        {/* Division Modal */}
        <SimpleModal
          open={showAddDivision}
          onOpenChange={(open) => {
            if (!open) closeAllDialogs();
            else setShowAddDivision(true);
          }}

          title={editingDivisionId ? "Edit Division" : "Add Division"}
          description="Define top-level organisational units."
          size="lg"
          footer={
            <Button
              onClick={handleSaveDivision}
              variant={editingDivisionId ? "secondary" : undefined}
              size={editingDivisionId ? "sm" : "default"}
            >
              {editingDivisionId ? "Update Division" : "Save Division"}
            </Button>
          }
        >
          <FormField id="division-name" label="Division Name">
            <Input
              value={newDivision.name}
              onChange={e => setNewDivision({ ...newDivision, name: e.target.value })}
            />
          </FormField>
          <FormField id="division-description" label="Description">
            <Input
              value={newDivision.description}
              onChange={e => setNewDivision({ ...newDivision, description: e.target.value })}
            />
          </FormField>
        </SimpleModal>

        {/* Branch Modal */}
        <SimpleModal
          open={showAddBranch}
          onOpenChange={(open) => {
            if (!open) closeAllDialogs();
            else setShowAddBranch(true);
          }}

          title={editingBranchId ? "Edit Branch" : "Add Branch"}
          description="Branches represent offices or operating units."
          size="lg"
          footer={
            <Button
              onClick={handleSaveBranch}
              variant={editingBranchId ? "secondary" : undefined}
              size={editingBranchId ? "sm" : "default"}
            >
              {editingBranchId ? "Update Branch" : "Save Branch"}
            </Button>
          }
        >
          <FormField id="branch-name" label="Branch Name">
            <Input
              value={newBranch.name}
              onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
            />
          </FormField>
          <FormField id="branch-location" label="Location">
            <Input
              value={newBranch.location}
              onChange={e => setNewBranch({ ...newBranch, location: e.target.value })}
            />
          </FormField>
          <FormField id="branch-division" label="Division">
            <Select
              value={newBranch.divisionId ? newBranch.divisionId.toString() : ""}
              onValueChange={v => setNewBranch({ ...newBranch, divisionId: Number(v) })}
            >
              <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
              <SelectContent>
                {divisions.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </SimpleModal>

        {/* User Modal */}
        <SimpleModal
          open={showAddUser}
          onOpenChange={(open) => {
            if (!open) closeAllDialogs();
            else setShowAddUser(true);
          }}

          title={editingUserId ? "Edit User" : "Add User"}
          description="Assign a user to a branch and define their role."
          size="xl"
          footer={
            <Button
              onClick={handleSaveUser}
              variant={editingUserId ? "secondary" : undefined}
              size={editingUserId ? "sm" : "default"}
            >
              {editingUserId ? "Update User" : "Save User"}
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="user-first-name" label="First Name">
              <Input
                value={newUser.firstName}
                onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
              />
            </FormField>
            <FormField id="user-last-name" label="Last Name">
              <Input
                value={newUser.lastName}
                onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField id="user-email" label="Email">
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </FormField>
            </div>

            <FormField id="user-division" label="Division">
              <Select
                value={newUser.divisionId ? newUser.divisionId.toString() : ""}
                onValueChange={v =>
                  setNewUser({ ...newUser, divisionId: Number(v), branchId: 0 })
                }
              >
                <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
                <SelectContent>
                  {divisions.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id="user-branch" label="Branch">
              <Select
                value={newUser.branchId ? newUser.branchId.toString() : ""}
                onValueChange={v => setNewUser({ ...newUser, branchId: Number(v) })}
                disabled={!newUser.divisionId}
              >
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {branches
                    .filter(b => b.divisionId === newUser.divisionId)
                    .map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {formatBranchLabel(b)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="md:col-span-2">
              <FormField id="user-role" label="Role">
                <Select
                  value={newUser.role}
                  onValueChange={v => setNewUser({ ...newUser, role: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        </SimpleModal>
      </div>
    );
  }

/* ---------- Supporting Components ---------- */
function FormField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">{value}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function EmptyState({ message, compact = false }: { message: string; compact?: boolean }) {
  return (
    <div
      className={`rounded-md border border-dashed text-center text-sm text-muted-foreground ${
        compact ? "bg-white px-4 py-3" : "bg-muted/30 px-6 py-8"
      }`}
    >
      {message}
    </div>
  );
}

