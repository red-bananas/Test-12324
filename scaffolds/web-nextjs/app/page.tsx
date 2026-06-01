import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Home",
};

export default function Page() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: siteConfig.name,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <h1 className="text-3xl font-semibold">Replace me with the clone UI.</h1>
    </main>
  );
}
