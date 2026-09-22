"use client";

import { UsersList } from "../components/users-list";

export default function AdminsPage() {
  return (
    <UsersList
      title="Admins"
      description="Accounts with admin access to manage the platform."
      fixedRole="ADMIN"
    />
  );
}
