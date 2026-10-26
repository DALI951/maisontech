import type { Metadata } from "next";
import { AddressBook } from "@/components/account/address-book";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mes adresses",
  robots: { index: false, follow: false },
};

export default async function AccountAddressesPage() {
  const user = await requireUser("/compte/adresses");
  return <AddressBook initial={user.addresses} />;
}
