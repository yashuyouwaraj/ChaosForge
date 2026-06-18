"use client";

import { Calendar, Mail, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function AccountCard({ settings }) {
  const { user } = useAuth();
  const userId = user?.id || settings.owner;
  const joinedDate = user?.createdAt || settings.createdAt;
  const plan = user?.plan || "free";

  return (
    <div className="glass rounded-[32px] p-8">
      <div className="flex items-center gap-3">
        <User className="h-7 w-7 cf-accent-text" />

        <h2 className="text-3xl font-black">Account</h2>
      </div>

      <p className="mt-3 text-muted-foreground">
        Your ChaosForge account information.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <InfoCard
          icon={<User size={18} />}
          label="User ID"
          value={userId}
        />

        <InfoCard icon={<Mail size={18} />} label="Email" value={user?.email || "-"} />

        <InfoCard
          icon={<ShieldCheck size={18} />}
          label="Plan"
          value={plan}
        />

        <InfoCard
          icon={<Calendar size={18} />}
          label="Joined"
          value={joinedDate ? new Date(joinedDate).toLocaleDateString() : "-"}
        />
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/10
        bg-black/20
        p-5
      "
    >
      <div className="flex items-center gap-3 cf-accent-text">
        {icon}

        <span className="text-sm uppercase tracking-[0.18em]">{label}</span>
      </div>

      <h3 className="mt-5 text-xl font-bold break-all">{value}</h3>
    </div>
  );
}
