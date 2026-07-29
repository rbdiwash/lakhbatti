import type { Metadata } from "next";
import { REGISTER_TAGLINE } from "../lib/register-motivation";
import { RegistrationProvider } from "./context";
import { RegistrationWizard } from "./wizard";

export const metadata: Metadata = {
  title: "Employee Registration",
  description: "Join the Lakhbatti cleaning workforce. Register, get matched to jobs, and start working.",
};

export default function RegisterPage() {
  return (
    <RegistrationProvider>
      <section className="bg-linear-to-b from-brand-50 to-white min-h-screen">
        {/* Page header */}
        <div className="border-b border-brand-100 bg-white">
          <div className="mx-auto max-w-2xl px-4 py-8 text-center sm:px-6">
            <span className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Join our team
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
              Employee Registration
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-500">
              Complete your profile to get matched to cleaning and gardening jobs across Sydney.
              Takes about 10 minutes — no rush.
            </p>
            <p className="mx-auto mt-4 max-w-md rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
              {REGISTER_TAGLINE}
            </p>
          </div>
        </div>

        <RegistrationWizard />
      </section>
    </RegistrationProvider>
  );
}
