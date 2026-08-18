"use client";

import { Suspense, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AgentProfileView } from "@/components/aro/AgentProfileView";
import { getAgentById } from "@/lib/mock-data";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

function AgentProfileGuarded() {
  const params = useParams<{ id: string }>();
  const { currentAroId, userName } = useApp();
  const { showToast } = useToast();
  const router = useRouter();

  const agent = getAgentById(params.id);
  // An agent's aroId is intrinsic to the record (not attacker-controlled), so this is a real
  // ownership check, not just a hidden nav item — an ARO can never view another ARO's agent
  // by editing the URL. Data-access functions are scoped the same way via currentAroId.
  const forbidden = !!agent && agent.aroId !== currentAroId;

  useEffect(() => {
    if (forbidden) {
      showToast("That agent isn't in your portfolio.", "error");
      router.replace("/aro/agents");
    }
  }, [forbidden, router, showToast]);

  if (!agent || forbidden) return null;

  return <AgentProfileView agentId={agent.id} basePath="/aro/agents" canRemove performedBy={userName} />;
}

export default function AgentProfilePage() {
  const allowed = useRequireAccess("aro");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <AgentProfileGuarded />
    </Suspense>
  );
}
