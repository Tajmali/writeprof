import { Metadata } from "next";
import { ClientDashboard } from "@/components/dashboard/ClientDashboard";

export const metadata: Metadata = {
  title: "Client Dashboard",
  description: "Manage your writing orders and track progress.",
};

export default function DashboardPage() {
  return <ClientDashboard />;
}
