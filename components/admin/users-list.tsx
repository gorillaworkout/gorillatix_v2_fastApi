"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export type UsersProps = {
  uid: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  role: string;
  created_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UsersProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleStats, setRoleStats] = useState<Record<string, number>>({});
  const [selectedUser, setSelectedUser] = useState<UsersProps | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [open, setOpen] = useState(false); // Control Dialog open

  const { toast } = useToast();
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const response = await fetch(
        "https://fastapi-gorillatix-production.up.railway.app/api/users"
      );
      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();
      const fetchedUsers: UsersProps[] = result.users;

      const stats: Record<string, number> = {};
      for (const user of fetchedUsers) {
        stats[user.role] = (stats[user.role] || 0) + 1;
      }

      setUsers(fetchedUsers);
      setRoleStats(stats);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleUpdate() {
    if (!selectedUser || !selectedRole || selectedUser.role === selectedRole) return;
    setIsUpdating(true);

    try {
      const response = await fetch(
        "https://fastapi-gorillatix-production.up.railway.app/api/users/role",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: selectedUser.uid, role: selectedRole }),
        }
      );

      if (!response.ok) throw new Error("Failed to update role");

      toast({ title: "Role updated successfully." });

      setUsers((prev) =>
        prev.map((user) =>
          user.uid === selectedUser.uid ? { ...user, role: selectedRole } : user
        )
      );

      setSelectedUser(null);
      setSelectedRole("");
      setOpen(false); // Close the dialog
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Failed to update role",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Users</h1>

      <div className="flex gap-6 text-sm text-muted-foreground">
        {Object.entries(roleStats).map(([role, count]) => (
          <div key={role}>
            <span>Total {role}s: </span>
            <span className="font-semibold">{count}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.uid}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.display_name || "-"}</TableCell>
                  <TableCell>
                    <Badge>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setSelectedRole(user.role);
                        setOpen(true);
                      }}
                    >
                      Change Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              UID:{" "}
              <span className="font-mono">
                {selectedUser?.uid || "No user selected"}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {selectedUser?.role === "admin" && (
                  <SelectItem value="user">User</SelectItem>
                )}
                {selectedUser?.role === "user" && (
                  <SelectItem value="admin">Admin</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Button
              className="w-full"
              disabled={isUpdating}
              onClick={handleRoleUpdate}
            >
              {isUpdating ? "Updating..." : "Save Role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
