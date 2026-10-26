import type { Metadata } from "next";
import { NotFoundBody } from "@/components/layout/not-found-body";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "La page demandée n'existe pas ou a été déplacée.",
  robots: { index: false, follow: false },
};

/** 404 inside the storefront (header + footer come from the (site) layout). */
export default function SiteNotFound() {
  return <NotFoundBody />;
}
