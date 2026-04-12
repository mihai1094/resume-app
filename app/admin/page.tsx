import { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AdminContent } from "./admin-content";

export const metadata: Metadata = {
  title: "Admin",
  description: "Moderate testimonials and review product feedback.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <AuthGuard featureName="admin dashboard">
      <AdminContent />
    </AuthGuard>
  );
}
