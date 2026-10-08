"use client";

import {
  Archive,
  Clock,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MailCheck,
  MailOpen,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type ContactMessageItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

type ContactStats = {
  total: number;
  unread: number;
  read: number;
  replied: number;
  archived: number;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: typeof Mail }
> = {
  UNREAD: {
    label: "Unread",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
    icon: Mail,
  },
  READ: {
    label: "Read",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300",
    icon: MailOpen,
  },
  REPLIED: {
    label: "Replied",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: MailCheck,
  },
  ARCHIVED: {
    label: "Archived",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400",
    icon: Archive,
  },
};

export default function AdminContactsPage() {
  const [items, setItems] = useState<ContactMessageItem[]>([]);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog States
  const [activeMessage, setActiveMessage] = useState<ContactMessageItem | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "10",
      });

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (selectedStatus !== "ALL") {
        params.set("status", selectedStatus);
      }

      const res = await fetch(`/api/admin/contacts?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data) {
        setItems(data.data.items || []);
        setStats(
          data.data.stats || {
            total: 0,
            unread: 0,
            read: 0,
            replied: 0,
            archived: 0,
          },
        );
        setTotalPages(data.data.meta?.totalPages || 1);
        setTotalCount(data.data.meta?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContacts();
  };

  const handleOpenDetail = async (item: ContactMessageItem) => {
    setActiveMessage(item);
    setNotesDraft(item.notes || "");

    // If message is unread, automatically mark as read
    if (item.status === "UNREAD") {
      try {
        const res = await fetch(`/api/admin/contacts/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "READ" }),
        });
        const updated = await res.json();
        if (updated.success && updated.data) {
          setItems((prev) =>
            prev.map((m) => (m.id === item.id ? updated.data : m)),
          );
          setActiveMessage(updated.data);
          setStats((prev) => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1),
            read: prev.read + 1,
          }));
        }
      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: "UNREAD" | "READ" | "REPLIED" | "ARCHIVED",
  ) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setItems((prev) => prev.map((m) => (m.id === id ? data.data : m)));
        if (activeMessage && activeMessage.id === id) {
          setActiveMessage(data.data);
        }
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!activeMessage) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/contacts/${activeMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesDraft }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActiveMessage(data.data);
        setItems((prev) =>
          prev.map((m) => (m.id === activeMessage.id ? data.data : m)),
        );
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/contacts/${deleteTargetId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        if (activeMessage?.id === deleteTargetId) {
          setActiveMessage(null);
        }
        setDeleteTargetId(null);
        fetchContacts();
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Contact Inquiries & Messages
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and respond to messages, inquiries, and listing requests
            submitted by visitors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContacts}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw
              className={cn("size-3.5", loading && "animate-spin")}
            />
            Refresh
          </Button>

          <Link
            href="/contact"
            target="_blank"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-[#133f35] px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1a4f43]"
          >
            View Public Form
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <button
          type="button"
          onClick={() => {
            setSelectedStatus("ALL");
            setPage(1);
          }}
          className={cn(
            "rounded-xl border p-4 text-left transition",
            selectedStatus === "ALL"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border bg-card hover:border-primary/40",
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Messages
            </span>
            <Inbox className="size-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {stats.total}
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedStatus("UNREAD");
            setPage(1);
          }}
          className={cn(
            "rounded-xl border p-4 text-left transition",
            selectedStatus === "UNREAD"
              ? "border-amber-500 bg-amber-500/10 shadow-xs"
              : "border-border bg-card hover:border-amber-400/50",
          )}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Unread
            </span>
            <Mail className="size-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-800 dark:text-amber-300">
            {stats.unread}
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedStatus("REPLIED");
            setPage(1);
          }}
          className={cn(
            "rounded-xl border p-4 text-left transition",
            selectedStatus === "REPLIED"
              ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
              : "border-border bg-card hover:border-emerald-400/50",
          )}
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Replied
            </span>
            <MailCheck className="size-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-800 dark:text-emerald-300">
            {stats.replied}
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedStatus("ARCHIVED");
            setPage(1);
          }}
          className={cn(
            "rounded-xl border p-4 text-left transition",
            selectedStatus === "ARCHIVED"
              ? "border-slate-500 bg-slate-500/10 shadow-xs"
              : "border-border bg-card hover:border-slate-400/50",
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Archived
            </span>
            <Archive className="size-4" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">
            {stats.archived}
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-md"
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, topic..."
            className="pl-9"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Filter status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium text-foreground outline-none"
          >
            <option value="ALL">All Statuses ({stats.total})</option>
            <option value="UNREAD">Unread ({stats.unread})</option>
            <option value="READ">Read ({stats.read})</option>
            <option value="REPLIED">Replied ({stats.replied})</option>
            <option value="ARCHIVED">Archived ({stats.archived})</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-50">Sender</TableHead>
              <TableHead className="w-45">Topic / Subject</TableHead>
              <TableHead>Message Preview</TableHead>
              <TableHead className="w-27.5">Status</TableHead>
              <TableHead className="w-30">Date</TableHead>
              <TableHead className="w-25 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <span className="text-xs font-medium">Loading messages…</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Inbox className="size-8 text-muted-foreground/60" />
                    <p className="text-sm font-semibold">No messages found</p>
                    <p className="text-xs text-muted-foreground">
                      {search || selectedStatus !== "ALL"
                        ? "Try clearing your filters or search terms."
                        : "Messages submitted via the contact form will appear here."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.READ;
                const dateFormatted = new Date(item.createdAt).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric", year: "numeric" },
                );

                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/40",
                      item.status === "UNREAD" && "bg-amber-500/3 font-medium",
                    )}
                    onClick={() => handleOpenDetail(item)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {item.status === "UNREAD" && (
                            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.email}
                        </div>
                        {item.phone && (
                          <div className="text-[11px] text-muted-foreground/80">
                            {item.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-block max-w-42.5 truncate text-xs font-medium text-foreground">
                        {item.subject || "General Inquiry"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <p className="line-clamp-2 max-w-md text-xs text-muted-foreground">
                        {item.message}
                      </p>
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                          statusCfg.badgeClass,
                        )}
                      >
                        {statusCfg.label}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {dateFormatted}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        // onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenDetail(item)}
                          title="View Message"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTargetId(item.id)}
                          title="Delete Message"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <div>
              Showing page <span className="font-semibold">{page}</span> of{" "}
              <span className="font-semibold">{totalPages}</span> ({totalCount} total)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Message Detail Modal */}
      {activeMessage && (
        <Dialog
          open={Boolean(activeMessage)}
          onOpenChange={(open) => {
            if (!open) setActiveMessage(null);
          }}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <DialogTitle className="text-lg font-bold">
                  {activeMessage.subject || "Contact Inquiry"}
                </DialogTitle>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    STATUS_CONFIG[activeMessage.status]?.badgeClass,
                  )}
                >
                  {STATUS_CONFIG[activeMessage.status]?.label}
                </span>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Sender Details */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <User className="size-4 text-muted-foreground shrink-0" />
                    <span>{activeMessage.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Mail className="size-4 text-muted-foreground shrink-0" />
                    <a
                      href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject || "Your Inquiry")}`}
                      className="text-primary hover:underline truncate"
                    >
                      {activeMessage.email}
                    </a>
                  </div>

                  {activeMessage.phone && (
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Phone className="size-4 text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${activeMessage.phone}`}
                        className="hover:underline"
                      >
                        {activeMessage.phone}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4 shrink-0" />
                    <span>
                      {new Date(activeMessage.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label htmlFor="message-body" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Message Body
                </label>
                <div className="mt-1.5 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm leading-relaxed text-foreground">
                  {activeMessage.message}
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label htmlFor="admin-notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Admin Follow-up Notes
                </label>
                <textarea
                  id="admin-notes"
                  rows={2}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Add internal notes about this user, phone calls, or actions taken..."
                  className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary"
                />
                <div className="mt-1 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isUpdating}
                    onClick={handleSaveNotes}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>

              {/* Quick Status Toggles */}
              <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground font-medium">
                  Update status:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    type="button"
                    size="xs"
                    variant={activeMessage.status === "REPLIED" ? "default" : "outline"}
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(activeMessage.id, "REPLIED")}
                    className={cn(
                      activeMessage.status === "REPLIED" && "bg-emerald-600 text-white hover:bg-emerald-700",
                    )}
                  >
                    <MailCheck className="size-3 mr-1" />
                    Mark Replied
                  </Button>

                  <Button
                    type="button"
                    size="xs"
                    variant={activeMessage.status === "READ" ? "default" : "outline"}
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(activeMessage.id, "READ")}
                  >
                    <MailOpen className="size-3 mr-1" />
                    Mark Read
                  </Button>

                  <Button
                    type="button"
                    size="xs"
                    variant={activeMessage.status === "UNREAD" ? "default" : "outline"}
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(activeMessage.id, "UNREAD")}
                  >
                    <Mail className="size-3 mr-1" />
                    Mark Unread
                  </Button>

                  <Button
                    type="button"
                    size="xs"
                    variant={activeMessage.status === "ARCHIVED" ? "default" : "outline"}
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(activeMessage.id, "ARCHIVED")}
                  >
                    <Archive className="size-3 mr-1" />
                    Archive
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteTargetId(activeMessage.id)}
              >
                <Trash2 className="size-4 mr-1" /> Delete
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveMessage(null)}
                >
                  Close
                </Button>
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject || "Your Inquiry")}`}
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-[#133f35] px-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1a4f43]"
                >
                  <Mail className="size-3.5 mr-1.5" /> Reply by Email
                </a>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTargetId && (
        <Dialog
          open={Boolean(deleteTargetId)}
          onOpenChange={(open) => {
            if (!open) setDeleteTargetId(null);
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="size-5" /> Delete Contact Message
              </DialogTitle>
            </DialogHeader>
            <p className="py-2 text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete this contact inquiry? This action
              cannot be undone.
            </p>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Deleting…" : "Delete Permanently"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
