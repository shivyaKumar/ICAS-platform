"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ChevronDown, ChevronRight } from "lucide-react";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Layers,
  Building2,
  Trash2,
  Edit,
} from "lucide-react";

/* ---------- Types ---------- */
interface Division {
  id: number;
  name: string;
  description?: string;
}

interface Branch {
  id: number;
  name: string;
  location: string;
  divisionId: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  branchId: number;
  divisionId: number;
  role: string;
}

interface Role {
  id: number;
  name: string;
}

export default function UserManagementPage() {
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

  const [newBranch, setNewBranch] = useState({
    name: "",
    location: "",
    divisionId: 0,
  });
  const [newDivision, setNewDivision] = useState({
    name: "",
    description: "",
  });
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    divisionId: 0,
    branchId: 0,
    role: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description?: string;
    onConfirm: () => void;
  }>({ title: "", description: "", onConfirm: () => {} });

  // Track expanded branches for showing users
  const [expandedBranches, setExpandedBranches] = useState<{ [id: number]: boolean }>({});

  const toggleBranch = (id: number) => {
    setExpandedBranches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* ---------- Fetch all data ---------- */
  const reloadAll = async () => {
    try {
      const [bRes, dRes, uRes, rRes, meRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/divisions"),
        fetch("/api/users"),
        fetch("/api/roles"),
        fetch("/api/me", { credentials: "include" }),
      ]);

      if (!bRes.ok || !dRes.ok || !uRes.ok || !rRes.ok || !meRes.ok) {
        throw new Error("Failed to reload data");
      }

      const [branchesData, divisionsData, usersData, rolesData, meData] =
        await Promise.all([bRes.json(), dRes.json(), uRes.json(), rRes.json(), meRes.json()]);

      let filteredRoles = rolesData;

      // Fix: correctly extract the first role from array
      const roleFromApi = Array.isArray(meData.roles) && meData.roles.length > 0
        ? meData.roles[0]
        : meData.role || "";

      if (roleFromApi === "IT Admin") {
        filteredRoles = rolesData.filter((r: Role) => r.name !== "IT Admin");
      } else if (roleFromApi === "Admin") {
        filteredRoles = rolesData.filter((r: Role) => r.name === "Standard User");
      }

      setBranches(branchesData);
      setDivisions(divisionsData);
      setUsers(usersData);
      setRoles(filteredRoles);
      setCurrentRole(roleFromApi); // Now properly sets "Super Admin" or "IT Admin"

    } catch (err) {
      console.error("Reload error", err);
      alert("Error refreshing data.");
    }
  };

  useEffect(() => {
    reloadAll();
  }, []);

  /* ---------- Branch Handlers ---------- */
  const handleSaveBranch = async () => {
    if (!newBranch.name.trim() || !newBranch.location.trim()) {
      return alert("Branch name and location are required");
    }
    if (!newBranch.divisionId || newBranch.divisionId <= 0) {
      return alert("You must select a division for this branch");
    }

    try {
      const body = {
        name: newBranch.name,
        location: newBranch.location,
        divisionId: newBranch.divisionId, // ✅ always send valid int
      };

      if (editingBranchId) {
        await fetch(`/api/branches/${editingBranchId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(`/api/branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      await reloadAll();
    } catch (err) {
      console.error("Save branch failed", err);
      alert("Error saving branch");
    }

    setNewBranch({ name: "", location: "", divisionId: 0 });
    setEditingBranchId(null);
    setShowAddBranch(false);
  };

  const handleDeleteBranch = (id: number) => {
    setConfirmConfig({
      title: "Delete Branch?",
      description: "Deleting this branch will also remove related users.",
      onConfirm: async () => {
        try {
          await fetch(`/api/branches/${id}`, { method: "DELETE" });
          await reloadAll();
        } catch {
          alert("Error deleting branch");
        }
      },
    });
    setConfirmOpen(true);
  };

  /* ---------- Division Handlers ---------- */
  const handleSaveDivision = async () => {
    if (!newDivision.name.trim()) {
      return alert("Division name is required");
    }

    try {
      const body = {
        name: newDivision.name,
        description: newDivision.description || null,
      };

      let res;
      if (editingDivisionId) {
        res = await fetch(`/api/divisions/${editingDivisionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/divisions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        return alert(`Error saving division: ${errorText}`);
      }

      await reloadAll();
      setNewDivision({ name: "", description: "" });
      setEditingDivisionId(null);
      setShowAddDivision(false);
    } catch (err) {
      console.error("Division save failed", err);
      alert("Error saving division.");
    }
  };

  const handleDeleteDivision = (id: number) => {
    setConfirmConfig({
      title: "Delete Division?",
      description: "Deleting this division will also remove its branches and users.",
      onConfirm: async () => {
        try {
          await fetch(`/api/divisions/${id}`, { method: "DELETE" });
          await reloadAll();
        } catch {
          alert("Error deleting division");
        }
      },
    });
    setConfirmOpen(true);
  };

  /* ---------- User Handlers ---------- */
  const handleSaveUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.branchId || !newUser.role) {
      return alert("Fill in all fields.");
    }

    try {
      const body = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        branchId: newUser.branchId,
        role: newUser.role,
      };

      if (editingUserId) {
        await fetch(`/api/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(`/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      await reloadAll();
    } catch (err) {
      console.error("User save failed", err);
      alert("Error saving user.");
    }

    setNewUser({ firstName: "", lastName: "", email: "", divisionId: 0, branchId: 0, role: "" });
    setEditingUserId(null);
    setShowAddUser(false);
  };

  const handleDeleteUser = (id: number) => {
    setConfirmConfig({
      title: "Delete User?",
      description: "Deleting this user will permanently remove their account.",
      onConfirm: async () => {
        try {
          await fetch(`/api/users/${id}`, { method: "DELETE" });
          await reloadAll();
        } catch {
          alert("Error deleting user");
        }
      },
    });
    setConfirmOpen(true);
  };

  /* ---------- Edit Handlers ---------- */
  const handleEditBranch = (branch: Branch) => {
    setNewBranch({
      name: branch.name,
      location: branch.location,
      divisionId: branch.divisionId,
    });
    setEditingBranchId(branch.id);
    setShowAddBranch(true);
  };

  const handleEditDivision = (division: Division) => {
    setNewDivision({
      name: division.name,
      description: division.description || "",
    });
    setEditingDivisionId(division.id);
    setShowAddDivision(true);
  };

  const handleEditUser = (user: User) => {
    const branch = branches.find((b) => b.id === user.branchId);
    const divisionId = branch ? branch.divisionId : 0;

    setNewUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      branchId: user.branchId,
      divisionId,
      role: user.role,
    });

    setEditingUserId(user.id);
    setShowAddUser(true);
  };

  /* ---------- UI ---------- */
  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 space-y-6 min-w-0">
      <ConfirmDialog
        open={confirmOpen}
        title={confirmConfig.title}
        description={confirmConfig.description}
        onConfirm={() => {
          confirmConfig.onConfirm();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage divisions, branches, and users
          </p>
        </div>
        <div className="flex gap-2">
          {/* Only Super Admin & IT Admin can manage divisions */}
          {(currentRole === "Super Admin" || currentRole === "IT Admin") && (
            <Button onClick={() => { setShowAddDivision(true); setEditingDivisionId(null); }}>
              <Layers className="h-4 w-4" /> Add Division
            </Button>
          )}

          {/* Only Super Admin & IT Admin can manage branches */}
          {(currentRole === "Super Admin" || currentRole === "IT Admin") && (
            <Button onClick={() => { setShowAddBranch(true); setEditingBranchId(null); }}>
              <Building2 className="h-4 w-4" /> Add Branch
            </Button>
          )}

          {/* Everyone except Staff can add users */}
          {currentRole !== "Staff" && (
            <Button onClick={() => { setShowAddUser(true); setEditingUserId(null); }}>
              <UserPlus className="h-4 w-4" /> Add User
            </Button>
          )}
        </div>
      </div>

      {/* Divisions Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Divisions</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">Division Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {divisions.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-4 py-2">{d.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{d.description || "-"}</td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    {(currentRole === "Super Admin" || currentRole === "IT Admin") && (
                      <>
                        <Button size="icon" onClick={() => handleEditDivision(d)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" onClick={() => handleDeleteDivision(d.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {divisions.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-sm text-muted-foreground">
                    No divisions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branches & Users by Division */}
      {divisions.map((d) => (
        <div key={d.id} className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Branches for {d.name}</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Branch</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Location</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.filter((b) => b.divisionId === d.id).map((b) => (
                  <React.Fragment key={b.id}>
                    <tr
                      className={`border-t transition-colors ${
                        expandedBranches[b.id] ? "bg-blue-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-2 font-medium flex items-center gap-2">
                        {b.name}
                        <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          {users.filter((u) => u.branchId === b.id).length}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{b.location}</td>
                      <td className="px-4 py-2 flex justify-center gap-2">
                        <Button size="icon" onClick={() => toggleBranch(b.id)}>
                          {expandedBranches[b.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        {(currentRole === "Super Admin" || currentRole === "IT Admin") && (
                          <>
                            <Button size="icon" onClick={() => handleEditBranch(b)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" onClick={() => handleDeleteBranch(b.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>

                    {expandedBranches[b.id] && (
                      <tr>
                        <td colSpan={3} className="px-4 py-2">
                          <div className="overflow-x-auto border rounded">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-2 py-1 text-left">Name</th>
                                  <th className="px-2 py-1 text-left">Email</th>
                                  <th className="px-2 py-1 text-left">Role</th>
                                  <th className="px-2 py-1 text-center">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {users.filter((u) => u.branchId === b.id).map((u) => (
                                  <tr key={u.id} className="border-t hover:bg-gray-50 transition-colors">
                                    <td className="px-2 py-1">{u.firstName} {u.lastName}</td>
                                    <td className="px-2 py-1">{u.email}</td>
                                    <td className="px-2 py-1">{u.role}</td>
                                    <td className="px-2 py-1 flex justify-center gap-1">
                                      <Button size="icon" onClick={() => handleEditUser(u)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button size="icon" onClick={() => handleDeleteUser(u.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                                {users.filter((u) => u.branchId === b.id).length === 0 && (
                                  <tr>
                                    <td colSpan={4} className="px-2 py-2 text-center text-muted-foreground">
                                      No users yet.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {branches.filter((b) => b.divisionId === d.id).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-sm text-muted-foreground">
                      No branches yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Modals */}
      {showAddBranch && (
        <Modal title={editingBranchId ? "Edit Branch" : "Add Branch"} onClose={() => { setShowAddBranch(false); setEditingBranchId(null); }}>
          <Label>Branch Name</Label>
          <Input value={newBranch.name} onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })} />

          <Label>Location</Label>
          <Input value={newBranch.location} onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })} />

          <Label>Division</Label>
          <Select value={newBranch.divisionId ? newBranch.divisionId.toString() : ""} onValueChange={(value) => setNewBranch({ ...newBranch, divisionId: Number(value) })}>
            <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
            <SelectContent>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSaveBranch} className="w-full">
            {editingBranchId ? "Update Branch" : "Save Branch"}
          </Button>
        </Modal>
      )}

      {showAddDivision && (
        <Modal title={editingDivisionId ? "Edit Division" : "Add Division"} onClose={() => { setShowAddDivision(false); setEditingDivisionId(null); }}>
          <Label>Division Name</Label>
          <Input value={newDivision.name} onChange={(e) => setNewDivision({ ...newDivision, name: e.target.value })} placeholder="Enter division name" />

          <Label>Description</Label>
          <Input value={newDivision.description} onChange={(e) => setNewDivision({ ...newDivision, description: e.target.value })} placeholder="Enter description" />

          <Button onClick={handleSaveDivision} className="w-full">
            {editingDivisionId ? "Update Division" : "Save Division"}
          </Button>
        </Modal>
      )}

      {showAddUser && (
        <Modal title={editingUserId ? "Edit User" : "Add User"} onClose={() => { setShowAddUser(false); setEditingUserId(null); }}>
          <Label>First Name</Label>
          <Input value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />

          <Label>Last Name</Label>
          <Input value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />

          <Label>Email</Label>
          <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />

          <Label>Division</Label>
          <Select value={newUser.divisionId ? newUser.divisionId.toString() : ""} onValueChange={(value) => setNewUser({ ...newUser, divisionId: Number(value), branchId: 0 })}>
            <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
            <SelectContent>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Branch</Label>
          <Select value={newUser.branchId ? newUser.branchId.toString() : ""} onValueChange={(value) => setNewUser({ ...newUser, branchId: Number(value) })}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>
              {branches.filter((b) => b.divisionId === newUser.divisionId).map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Role</Label>
          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSaveUser} className="w-full">
            {editingUserId ? "Update User" : "Save User"}
          </Button>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Simple Modal ---------- */
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void; }) {
  return (
    <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,42rem)]">
      <Card className="relative rounded-2xl shadow-2xl border">
        <button className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" onClick={onClose}>
          ×
        </button>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5 max-h-[75vh] overflow-y-auto">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
