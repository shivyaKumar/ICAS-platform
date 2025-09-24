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
  branchId: number;
  description?: string;
}

interface Branch {
  id: number;
  name: string;
  location: string;
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

  const [showAddBranch, setShowAddBranch] = useState(false);
  const [showAddDivision, setShowAddDivision] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [editingDivisionId, setEditingDivisionId] = useState<number | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [newBranch, setNewBranch] = useState({ name: "", location: "" });
  const [newDivision, setNewDivision] = useState({
    name: "",
    branchId: 0,
    description: "",
  });
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    branchId: 0,
    divisionId: 0,
    role: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
  title: string;
  description?: string;
  onConfirm: () => void;
}>({ title: "", description: "", onConfirm: () => {} });
  
  // Track which division rows are expanded
  const [expandedDivisions, setExpandedDivisions] = useState<{ [id: number]: boolean }>({});

  const toggleDivision = (id: number) => {
    setExpandedDivisions(prev => ({ ...prev, [id]: !prev[id] }));
  };


  /* ---------- Fetch all data ---------- */
  const reloadAll = async () => {
  try {
    const [bRes, dRes, uRes, rRes, meRes] = await Promise.all([
      fetch("/api/branches"),
      fetch("/api/divisions"),
      fetch("/api/users"),
      fetch("/api/roles"),
      fetch("/api/me", { credentials: "include" }), // fetch current user
    ]);

    if (!bRes.ok || !dRes.ok || !uRes.ok || !rRes.ok || !meRes.ok) {
      throw new Error("Failed to reload data");
    }

    const [branchesData, divisionsData, usersData, rolesData, meData] =
      await Promise.all([
        bRes.json(),
        dRes.json(),
        uRes.json(),
        rRes.json(),
        meRes.json(),
      ]);

    // Apply role filtering logic
    let filteredRoles = rolesData;

    if (meData.role === "IT Admin") {
      filteredRoles = rolesData.filter((r: Role) => r.name !== "IT Admin");
    } else if (meData.role === "Admin") {
      filteredRoles = rolesData.filter((r: Role) => r.name === "Standard User");
    }

    setBranches(branchesData);
    setDivisions(divisionsData);
    setUsers(usersData);
    setRoles(filteredRoles); // set only allowed roles
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

    try {
      if (editingBranchId) {
        await fetch(`/api/branches/${editingBranchId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBranch),
        });
      } else {
        await fetch(`/api/branches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBranch),
        });
      }
      await reloadAll();
    } catch (err) {
      console.error("Save branch failed", err);
      alert("Error saving branch");
    }

    setNewBranch({ name: "", location: "" });
    setEditingBranchId(null);
    setShowAddBranch(false);
  };

  /* ---------- Branch Delete ---------- */
  const handleDeleteBranch = (id: number) => {
    setConfirmConfig({
      title: "Delete Branch?",
      description: "Deleting this branch will also remove all related divisions and users. This action cannot be undone.",
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
    if (!newDivision.name.trim() || !newDivision.branchId) {
      return alert("Division name and branch are required");
    }

    try {
      const body = {
        name: newDivision.name,
        branchId: newDivision.branchId,
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
        console.error("Division save failed:", errorText);
        return alert(`Error saving division: ${errorText}`);
      }

      await reloadAll();
      setNewDivision({ name: "", branchId: 0, description: "" });
      setEditingDivisionId(null);
      setShowAddDivision(false);
    } catch (err) {
      console.error("Division save failed", err);
      alert("Unexpected error saving division. See console for details.");
    }
  };

  /* ---------- Division Delete ---------- */
  const handleDeleteDivision = (id: number) => {
    setConfirmConfig({
      title: "Delete Division?",
      description: "Deleting this division will also remove all users within it. This action cannot be undone.",
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
    if (
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.divisionId ||
      !newUser.role
    ) {
      return alert("Fill in all fields.");
    }

    try {
      const body = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        divisionId: newUser.divisionId, //backend expects only divisionId
        role: newUser.role,
      };

      let res;
      if (editingUserId) {
        res = await fetch(`/api/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error("User save failed:", errorText);
        return alert(`Error saving user: ${errorText}`);
      }

      await reloadAll();
    } catch (err) {
      console.error("User save failed", err);
      alert("Unexpected error saving user.");
    }

    setNewUser({
      firstName: "",
      lastName: "",
      email: "",
      branchId: 0,
      divisionId: 0,
      role: "",
    });
    setEditingUserId(null);
    setShowAddUser(false);
  };

  const handleDeleteUser = (id: number) => {
  setConfirmConfig({
    title: "Delete User?",
    description: "Deleting this user will permanently remove their account. This action cannot be undone.",
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
    });
    setEditingBranchId(branch.id);
    setShowAddBranch(true);
  };

  const handleEditDivision = (division: Division) => {
    setNewDivision({
      name: division.name,
      branchId: division.branchId,
      description: division.description || "",
    });
    setEditingDivisionId(division.id);
    setShowAddDivision(true);
  };

  const handleEditUser = (user: User) => {
  // Look up the division from the user's divisionId
  const division = divisions.find((d) => d.id === user.divisionId);

  setNewUser({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    branchId: division ? division.branchId : 0,  // auto-fill branch from division
    divisionId: user.divisionId,
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
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage branches, divisions, and users
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowAddBranch(true);
              setEditingBranchId(null);
            }}
          >
            <Building2 className="h-4 w-4" /> Add Branch
          </Button>
          <Button
            onClick={() => {
              setShowAddDivision(true);
              setEditingDivisionId(null);
            }}
          >
            <Layers className="h-4 w-4" /> Add Division
          </Button>
          <Button
            onClick={() => {
              setShowAddUser(true);
              setEditingUserId(null);
            }}
          >
            <UserPlus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Branches Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Branches</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Branch Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Location
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {b.location}
                  </td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    <Button
                      size="icon"
                      variant="primary"
                      onClick={() => handleEditBranch(b)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="primary"
                      onClick={() => handleDeleteBranch(b.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-center text-sm text-muted-foreground"
                  >
                    No branches yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Divisions & Users */}
      {branches.map((b) => (
        <div key={b.id} className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Divisions for {b.name}</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Division</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {divisions.filter(d => d.branchId === b.id).map(d => (
                  <React.Fragment key={d.id}>
                    <tr
                      className={`border-t transition-colors ${
                        expandedDivisions[d.id] ? "bg-blue-100" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-2 font-medium flex items-center gap-2">
                        {d.name}
                        {/* User count badge */}
                        <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          {users.filter((u) => u.divisionId === d.id).length}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{d.description || "-"}</td>
                      <td className="px-4 py-2 flex justify-center gap-2">
                        <Button size="icon" variant="primary" onClick={() => toggleDivision(d.id)}>
                          {expandedDivisions[d.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button size="icon" onClick={() => handleEditDivision(d)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" onClick={() => handleDeleteDivision(d.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>

                    {/* Expanded: show users */}
                    {expandedDivisions[d.id] && (
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
                                {users.filter(u => u.divisionId === d.id).map(u => (
                                  <tr
                                    key={u.id}
                                    className="border-t hover:bg-gray-50 transition-colors"
                                  >
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
                                {users.filter(u => u.divisionId === d.id).length === 0 && (
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


                {divisions.filter(d => d.branchId === b.id).length === 0 && (
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
      ))}


      {/* Modals */}
      {showAddBranch && (
        <Modal
          title={editingBranchId ? "Edit Branch" : "Add Branch"}
          onClose={() => {
            setShowAddBranch(false);
            setEditingBranchId(null);
          }}
        >
          <Label>Branch Name</Label>
          <Input
            value={newBranch.name}
            onChange={(e) =>
              setNewBranch({ ...newBranch, name: e.target.value })
            }
            placeholder="Enter branch name"
          />

          <Label>Branch Location</Label>
          <Input
            value={newBranch.location}
            onChange={(e) =>
              setNewBranch({ ...newBranch, location: e.target.value })
            }
            placeholder="Enter branch location"
          />
          <Button onClick={handleSaveBranch} className="w-full">
            {editingBranchId ? "Update Branch" : "Save Branch"}
          </Button>
        </Modal>
      )}

      {showAddDivision && (
        <Modal
          title={editingDivisionId ? "Edit Division" : "Add Division"}
          onClose={() => {
            setShowAddDivision(false);
            setEditingDivisionId(null);
          }}
        >
          <Label>Division Name</Label>
          <Input
            value={newDivision.name}
            onChange={(e) =>
              setNewDivision({ ...newDivision, name: e.target.value })
            }
            placeholder="Enter division name"
          />

          <Label>Description</Label>
          <Input
            value={newDivision.description}
            onChange={(e) =>
              setNewDivision({ ...newDivision, description: e.target.value })
            }
            placeholder="Enter description"
          />

          <Label>Branch</Label>
          <Select
            value={newDivision.branchId.toString()}
            onValueChange={(value) =>
              setNewDivision({ ...newDivision, branchId: Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleSaveDivision} className="w-full">
            {editingDivisionId ? "Update Division" : "Save Division"}
          </Button>
        </Modal>
      )}

      {showAddUser && (
        <Modal
          title={editingUserId ? "Edit User" : "Add User"}
          onClose={() => {
            setShowAddUser(false);
            setEditingUserId(null);
          }}
        >
          <Label>First Name</Label>
          <Input
            value={newUser.firstName}
            onChange={(e) =>
              setNewUser({ ...newUser, firstName: e.target.value })
            }
            placeholder="Enter first name"
          />

          <Label>Last Name</Label>
          <Input
            value={newUser.lastName}
            onChange={(e) =>
              setNewUser({ ...newUser, lastName: e.target.value })
            }
            placeholder="Enter last name"
          />

          <Label>Email</Label>
          <Input
            type="email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
            placeholder="Enter email"
          />

          <Label>Branch</Label>
          <Select
            value={newUser.branchId ? newUser.branchId.toString() : ""}
            onValueChange={(value) =>
              setNewUser({ ...newUser, branchId: Number(value), divisionId: 0 })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch">
                {branches.find((b) => b.id === newUser.branchId)?.name || "Select branch"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Division</Label>
          <Select
            value={newUser.divisionId ? newUser.divisionId.toString() : ""}
            onValueChange={(value) =>
              setNewUser({ ...newUser, divisionId: Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select division">
                {divisions.find((d) => d.id === newUser.divisionId)?.name || "Select division"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {divisions
                .filter((d) => d.branchId === newUser.branchId)
                .map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Label>Role</Label>
          <Select
            value={newUser.role || ""}
            onValueChange={(value) =>
              setNewUser({ ...newUser, role: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
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
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,42rem)]">
      <Card className="relative rounded-2xl shadow-2xl border">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
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
