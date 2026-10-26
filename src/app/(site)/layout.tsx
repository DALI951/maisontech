import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getStoreData } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ categories, settings }, user] = await Promise.all([getStoreData(), getCurrentUser()]);

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[100] focus:rounded-field focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Aller au contenu
      </a>
      <SiteHeader
        announcements={settings.announcements}
        categories={categories
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((category) => ({
            slug: category.slug,
            name: category.name,
            shortName: category.shortName,
          }))}
        user={user}
        supportPhone={settings.supportPhone}
      />
      <main id="contenu">{children}</main>
      <SiteFooter
        categories={categories.slice().sort((a, b) => a.sortOrder - b.sortOrder)}
        supportPhone={settings.supportPhone}
        supportEmail={settings.supportEmail}
        supportHours={settings.supportHours}
        storeAddress={settings.storeAddress}
      />
    </>
  );
}
