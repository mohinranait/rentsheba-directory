"use client";

import { UsersList } from "./components/users-list";

export default function AllUsersPage() {
  return (
    <UsersList
      title="All Users"
      description="Manage every account on the platform — update info, take action, or delete users."
    />
  );
}
