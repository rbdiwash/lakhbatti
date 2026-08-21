"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createJob } from "../lib/api";
import { services } from "../lib/site";
import type { CreateJobPayload, EmployeeRow } from "../lib/types";

const emptyForm: CreateJobPayload = {
  title: "",
  category: "Cleaning",
  description: "",
  address: "",
  suburb: "",
  state: "NSW",
  postcode: "",
  scheduledDate: "",
  startTime: "",
  endTime: "",
  payRate: "",
  notes: "",
  employeeId: "",
};

type Props = {
  open: boolean;
  employees: EmployeeRow[];
  preselectedEmployeeId?: string;
  onClose: () => void;
};

export function JobFormDialog({
  open,
  employees,
  preselectedEmployeeId,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm({
      ...emptyForm,
      employeeId: preselectedEmployeeId ?? "",
    });
  }, [open, preselectedEmployeeId]);

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["employees"] }),
        queryClient.invalidateQueries({ queryKey: ["jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["employee"] }),
      ]);
      onClose();
    },
    onError: () => {
      setError("Could not create the job. Check the backend and try again.");
    },
  });

  if (!open) return null;

  function update<K extends keyof CreateJobPayload>(
    key: K,
    value: CreateJobPayload[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    mutation.mutate(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Create job</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Assign a cleaning or gardening job to a registered employee.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-medium text-zinc-700">
            Title
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              placeholder="e.g. End of lease clean"
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Category
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              {services.map((service) => (
                <option key={service.title} value={service.title}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Assign employee
            <select
              value={form.employeeId}
              onChange={(e) => update("employeeId", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            >
              <option value="">Unassigned</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} — {employee.suburb || employee.email}
                </option>
              ))}
            </select>
          </label>

          <label className="sm:col-span-2 text-sm font-medium text-zinc-700">
            Description
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="sm:col-span-2 text-sm font-medium text-zinc-700">
            Address
            <input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Suburb
            <input
              value={form.suburb}
              onChange={(e) => update("suburb", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Postcode
            <input
              value={form.postcode}
              onChange={(e) => update("postcode", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Date
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => update("scheduledDate", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            Pay rate ($/hr)
            <input
              value={form.payRate}
              onChange={(e) => update("payRate", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-medium text-zinc-700">
            Start time
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => update("startTime", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-zinc-700">
            End time
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => update("endTime", e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : "Create job"}
          </button>
        </div>
      </form>
    </div>
  );
}
