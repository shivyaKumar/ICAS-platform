"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserPlus, Search, MoreHorizontal, Edit, Shield, Eye, CheckCircle, XCircle, Clock } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  division: string
  status: "active" | "inactive" | "pending"
  lastLogin: string
  permissions: string[]
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@carpenters.com.fj",
    role: "Administrator",
    division: "IT Security",
    status: "active",
    lastLogin: "2 hours ago",
    permissions: ["full_access", "user_management", "system_config"],
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.johnson@carpenters.com.fj",
    role: "Division Manager",
    division: "HR Department",
    status: "active",
    lastLogin: "1 day ago",
    permissions: ["division_access", "compliance_view", "audit_manage"],
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@carpenters.com.fj",
    role: "Compliance Officer",
    division: "Risk Management",
    status: "active",
    lastLogin: "3 hours ago",
    permissions: ["compliance_manage", "risk_assess", "report_generate"],
  },
  {
    id: "4",
    name: "Lisa Wong",
    email: "lisa.wong@carpenters.com.fj",
    role: "User",
    division: "Finance",
    status: "pending",
    lastLogin: "Never",
    permissions: ["basic_access", "compliance_view"],
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@carpenters.com.fj",
    role: "Division Manager",
    division: "Operations",
    status: "inactive",
    lastLogin: "2 weeks ago",
    permissions: ["division_access", "compliance_view"],
  },
]

const roleColors = {
  Administrator: "bg-red-100 text-red-800 border-red-200",
  "Division Manager": "bg-blue-100 text-blue-800 border-blue-200",
  "Compliance Officer": "bg-green-100 text-green-800 border-green-200",
  User: "bg-gray-100 text-gray-800 border-gray-200",
}

const statusIcons = {
  active: <CheckCircle className="h-4 w-4 text-green-500" />,
  inactive: <XCircle className="h-4 w-4 text-red-500" />,
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
}

export default function UserManagementPage() {
  const [users] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  // Removed unused showAddUser state

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.division.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const UserCard = ({ user }: { user: User }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{user.name}</h3>
                {statusIcons[user.status]}
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={roleColors[user.role as keyof typeof roleColors]}>{user.role}</Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{user.division}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last login: {user.lastLogin}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</p>
                <p className="text-xs text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{users.filter((u) => u.status === "pending").length}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "Administrator").length}</p>
                <p className="text-xs text-muted-foreground">Administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or division..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="Division Manager">Division Manager</SelectItem>
                  <SelectItem value="Compliance Officer">Compliance Officer</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* User Details Modal/Panel would go here */}
      {selectedUser && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-2xl overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Manage user information and permissions</CardDescription>
            </div>
            <Button variant="ghost" onClick={() => setSelectedUser(null)}>
              ×
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <Input value={selectedUser.name} readOnly />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={selectedUser.email} readOnly />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={selectedUser.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrator">Administrator</SelectItem>
                        <SelectItem value="Division Manager">Division Manager</SelectItem>
                        <SelectItem value="Compliance Officer">Compliance Officer</SelectItem>
                        <SelectItem value="User">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Division</Label>
                    <Input value={selectedUser.division} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="permissions" className="space-y-4">
                <div className="space-y-2">
                  {selectedUser.permissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{permission.replace("_", " ").toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="activity">
                <p className="text-sm text-muted-foreground">Last login: {selectedUser.lastLogin}</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
