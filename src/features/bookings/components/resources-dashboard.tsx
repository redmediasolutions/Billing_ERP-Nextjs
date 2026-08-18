"use client";

import { useMemo, useState } from "react";
import { Edit3, LayoutGrid, Loader2, Plus, Search } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { matchesSearch } from "@/lib/erp-search";
import { useUrlSearchParam } from "@/lib/use-url-search";

import { ResourceFormSheet } from "../addform/resource-form-sheet";
import { ResourceTypesDialog } from "../addform/resource-types-dialog";
import {
  useBookingResources,
  useCreateBookingResource,
  useUpdateBookingResource,
} from "../hooks/use-bookings";
import type { BookingResource, BookingResourceInput } from "../types";

export function ResourcesDashboard() {
  const { data: resources = [], isLoading, error } = useBookingResources();
  const { value: search, setSearch } = useUrlSearchParam();
  const createResource = useCreateBookingResource();
  const updateResource = useUpdateBookingResource();

  const [formOpen, setFormOpen] = useState(false);
  const [typesOpen, setTypesOpen] = useState(false);
  const [editing, setEditing] = useState<BookingResource | null>(null);
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(
    () =>
      resources.filter((resource) =>
        matchesSearch(search, [
          resource.resource_name,
          resource.resource_code,
          resource.type_label,
          resource.employee_name,
          resource.item_name,
        ])
      ),
    [resources, search]
  );

  function openCreate() {
    setEditing(null);
    setActionError("");
    setFormOpen(true);
  }

  async function saveResource(input: BookingResourceInput) {
    try {
      setActionError("");
      if (editing?.id) {
        await updateResource.mutateAsync({ id: editing.id, input });
      } else {
        await createResource.mutateAsync(input);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to save resource."
      );
      throw err;
    }
  }

  return (
    <section className="w-full space-y-6 text-left">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bookable capacity
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-sm text-muted-foreground">
            Rooms, cottages, chairs, cabins, and staff units that can be
            reserved. Occupancy is checked against capacity, not just busy/free.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTypesOpen(true)}>
            Types
          </Button>
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New resource
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search resources..."
          className="pl-9"
        />
      </div>

      {actionError ? (
        <p className="text-sm font-medium text-destructive">{actionError}</p>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading resources...
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-start justify-center gap-2 p-6">
              <p className="text-sm font-medium text-destructive">
                Unable to load resources.
              </p>
              <p className="text-xs text-muted-foreground">
                Mount /bookings/resources on the API after running schema.sql.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title="No resources yet"
              description="Add Deluxe 101 for a lodge, or Cabin 2 / a therapist for a spa. Then take bookings against them."
              actionLabel="Add first resource"
              onAction={openCreate}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Default item</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <p className="font-medium">{resource.resource_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.resource_code || resource.reference}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {resource.type_label || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{resource.capacity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {resource.item_name || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {resource.employee_name || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(resource);
                          setFormOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ResourceFormSheet
        open={formOpen}
        resource={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={saveResource}
      />

      <ResourceTypesDialog
        open={typesOpen}
        onClose={() => setTypesOpen(false)}
      />
    </section>
  );
}
