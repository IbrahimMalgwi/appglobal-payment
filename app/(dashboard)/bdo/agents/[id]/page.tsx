"use client";

import { Suspense } from "react";
import { useParams, notFound } from "next/navigation";
import { AgentProfileView } from "@/components/aro/AgentProfileView";
import { getAgentById } from "@/lib/mock-data";
import { useApp } from "@/context/AppContext";
import { useRequireAccess } from "@/components/access/RequireAccess";

function BdoAgentProfile() {
  const params = useParams<{ id: string }>();
  const { userName } = useApp();
  const agent = getAgentById(params.id);
  if (!agent) return notFound();
  // BDOs view across the org — no aroId restriction — but removal stays an ARO-only action.
  return <AgentProfileView agentId={agent.id} basePath="/bdo/agents" canRemove={false} performedBy={userName} />;
}

export default function BdoAgentProfilePage() {
  const allowed = useRequireAccess("bdo");
  if (!allowed) return null;
  return (
    <Suspense fallback={null}>
      <BdoAgentProfile />
    </Suspense>
  );
}
