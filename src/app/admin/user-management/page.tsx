"use client";

import { useState, useEffect } from "react";
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
import {
  Users,

  UserPlus,
  Layers,
  Building2,
  Trash2,
  Edit,
} from "lucide-react";

/* ---------- Types ---------- */
interface Division {
  id: number;       // int in DB
  name: string;
  branchId: number; // int in DB
  description?: string; 
}

interface Branch {
  id: number;       // int in DB
  name: string;
  location: string;
}

interface User {
  id: number;       // int in DB
  firstName: string;
  lastName: string;
  email: string;
  branchId: number;    // int in DB
  divisionId: number;  // int in DB
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
  const [newDivision, setNewDivision] = useState({ name: "", branchId: 0, description: "" });
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    branchId: 0,
    divisionId: 0,
    role: "",
  });

  /* ---------- Fetch all data ---------- */
  const reloadAll = async () => {
    try {
      const [bRes, dRes, uRes, rRes] = await Promise.all([
        fetch("/api/branches"),
        fetch("/api/divisions"),
        fetch("/api/users"),
        fetch("/api/roles"),
      ]);

      if (!bRes.ok || !dRes.ok || !uRes.ok || !rRes.ok) {
        throw new Error("Failed to reload data");
      }

      setBranches(await bRes.json());
      setDivisions(await dRes.json());
      setUsers(await uRes.json());
      setRoles(await rRes.json());
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

  const handleDeleteBranch = async (id: number) => {
    if (!confirm("Delete this branch and all related divisions/users?")) return;
    try {
      await fetch(`/api/branches/${id}`, { method: "DELETE" });
      await reloadAll();
    } catch {
      alert("Error deleting branch");
    }
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

    // reset only if successful
    setNewDivision({ name: "", branchId: 0, description: "" });
    setEditingDivisionId(null);
    setShowAddDivision(false);
  } catch (err) {
    console.error("Division save failed", err);
    alert("Unexpected error saving division. See console for details.");
  }
};

  /* ---------- User Handlers ---------- */
  const handleSaveUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.branchId || !newUser.divisionId || !newUser.role) {
      return alert("Fill in all fields.");
    }

    try {
      if (editingUserId) {
        await fetch(`/api/users/${editingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
      } else {
        await fetch(`/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
      }
      await reloadAll();
    } catch {
      alert("Error saving user");
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

  /* ---------- User Handlers ---------- */
const handleDeleteUser = async (id: number) => {
  if (!confirm("Delete this user?")) return;
  try {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    await reloadAll();
  } catch {
    alert("Error deleting user");
  }
};


  /* ---------- Division Handlers ---------- */
  const handleDeleteDivision = async (id: number) => {
    if (!confirm("Delete this division and all related users?")) return;
    try {
      await fetch(`/api/divisions/${id}`, { method: "DELETE" });
      await reloadAll();
    } catch {
      alert("Error deleting division");
    }
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
    description: division.description || ""   // ✅ add description
  });
  setEditingDivisionId(division.id);
  setShowAddDivision(true);
};


  const handleEditUser = (user: User) => {
    setNewUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      branchId: user.branchId,
      divisionId: user.divisionId,
      role: user.role,
    });
    setEditingUserId(user.id);
    setShowAddUser(true);
  };

  /* ---------- UI ---------- */
  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage branches, divisions, and users</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => { setShowAddBranch(true); setEditingBranchId(null); }}>
            <Building2 className="h-4 w-4" /> Add Branch
          </Button>
          <Button onClick={() => { setShowAddDivision(true); setEditingDivisionId(null); }}>
            <Layers className="h-4 w-4" /> Add Division
          </Button>
          <Button onClick={() => { setShowAddUser(true); setEditingUserId(null); }}>
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
                <th className="px-4 py-2 text-left text-sm font-semibold">Branch Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Location</th>
                <th className="px-4 py-2 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="px-4 py-2">{b.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{b.location}</td>
                  <td className="px-4 py-2 flex justify-center gap-2">
                    <Button size="icon" variant="primary" onClick={() => handleEditBranch(b)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="primary" onClick={() => handleDeleteBranch(b.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
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

      {/* Divisions & Users */}
      {branches.map((b) => (
        <div key={b.id} className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Divisions for {b.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {divisions.filter((d) => d.branchId === b.id).map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{d.name}</span>
                    <div className="flex gap-2">
                      <Button size="icon" onClick={() => handleEditDivision(d)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" onClick={() => handleDeleteDivision(d.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-2">
                    {users.filter((u) => u.divisionId === d.id).map((u) => (
                      <div key={u.id} className="flex items-center justify-between bg-muted p-2 rounded">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-sm">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-muted-foreground">{u.email} · {u.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" onClick={() => handleEditUser(u)}><Edit className="h-4 w-4" /></Button>
                          <Button size="icon" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {divisions.filter((d) => d.branchId === b.id).length === 0 && (
            <p className="text-sm text-muted-foreground">No divisions yet.</p>
          )}
        </div>
      ))}

      {/* Modals */}
      {showAddBranch && (
        <Modal title={editingBranchId ? "Edit Branch" : "Add Branch"} onClose={() => { setShowAddBranch(false); setEditingBranchId(null); }}>
          <Label>Branch Name</Label>
          <Input
            value={newBranch.name}
            onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
            placeholder="Enter branch name"
          />

          <Label>Branch Location</Label>
          <Input
            value={newBranch.location}
            onChange={(e) => setNewBranch({ ...newBranch, location: e.target.value })}
            placeholder="Enter branch location"
          />
          <Button onClick={handleSaveBranch} className="w-full">{editingBranchId ? "Update Branch" : "Save Branch"}</Button>
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
        <Modal title={editingUserId ? "Edit User" : "Add User"} onClose={() => { setShowAddUser(false); setEditingUserId(null); }}>
          <Label>First Name</Label>
          <Input value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} placeholder="Enter first name" />
          <Label>Last Name</Label>
          <Input value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} placeholder="Enter last name" />
          <Label>Email</Label>
          <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="Enter email" />
          <Label>Branch</Label>
          <Select value={newUser.branchId.toString()} onValueChange={(value) => setNewUser({ ...newUser, branchId: Number(value), divisionId: 0 })}>
            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
            <SelectContent>{branches.map((b) => (<SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>))}</SelectContent>
          </Select>
          <Label>Division</Label>
          <Select value={newUser.divisionId.toString()} onValueChange={(value) => setNewUser({ ...newUser, divisionId: Number(value) })}>
            <SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger>
            <SelectContent>{divisions.filter((d) => d.branchId === newUser.branchId).map((d) => (<SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>))}</SelectContent>
          </Select>
          <Label>Role</Label>
          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
            <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.name}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSaveUser} className="w-full">{editingUserId ? "Update User" : "Save User"}</Button>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Simple Modal ---------- */
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(92vw,42rem)]">
      <Card className="relative rounded-2xl shadow-2xl border">
        <button className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" onClick={onClose}>
          ×
        </button>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent className="space-y-4 p-5 max-h-[75vh] overflow-y-auto">{children}</CardContent>
      </Card>
    </div>
  );
}
