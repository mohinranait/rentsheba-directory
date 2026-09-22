"use client";

import { UsersList } from "../components/users-list";

export default function SellersPage() {
  return (
    <UsersList
      title="Sellers"
      description="All platform sellers — regular users who create listings."
      fixedRole="USER"
    />
  );
}
