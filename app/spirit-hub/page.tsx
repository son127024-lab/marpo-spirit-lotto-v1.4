import MarpoSpiritDashboardV2 from "@/components/marpo-spirit-dashboard-v2";

export const dynamic = "force-dynamic";

export default function SpiritHubPage() {
  return (
    <main className="min-h-screen bg-[#050505] p-5 md:p-10">
      <div className="mx-auto max-w-7xl">
        <MarpoSpiritDashboardV2 />
      </div>
    </main>
  );
}