"use client";

import { useState } from "react";
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
  name: string;
  email: string;
  division: string;
  role: "Admin" | "Staff";
  password: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [generatedPw, setGeneratedPw] = useState("");

  // form state
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    division: "",
    role: "Staff" as "Admin" | "Staff",
    password: "",
  });

  const divisions = ["Finance", "HR", "IT", "Operations"];

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.division) return;

    setUsers([...users, { id: (users.length + 1).toString(), ...newUser }]);

    // reset form
    setNewUser({ name: "", email: "", division: "", role: "Staff", password: "" });
    setGeneratedPw("");
    setShowAddForm(false);
  };

  const handleGeneratePassword = () => {
    const pw = Math.random().toString(36).slice(-8); // simple random pw
    setGeneratedPw(pw);
    setNewUser({ ...newUser, password: pw });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowAddForm(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <Card className="relative">
          {/* Close Button */}
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
            onClick={() => setShowAddForm(false)}
          >
            ×
          </button>

          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <Label>Division</Label>
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
            </div>
            <div>
              <Label>User Privilege</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, role: value as "Admin" | "Staff" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Section */}
            <div>
              <Label>Generated Password</Label>
              <Input
                value={generatedPw}
                readOnly
                placeholder="Click 'Generate PW' to create one"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={handleGeneratePassword}
              >
                Generate PW
              </Button>
              <Button type="button" className="flex-1" onClick={handleAddUser}>
                Save User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  {user.division} • {user.role}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <p className="text-muted-foreground">No users yet.</p>
        )}
      </div>
    </div>
  );
}
