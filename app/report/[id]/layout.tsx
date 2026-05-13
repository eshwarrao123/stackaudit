import { fetchReport } from "@/lib/supabase/db";
import type { Metadata } from "next";



export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://stackaudit.vercel.app";
  const reportUrl = `${baseUrl}/report/${id}`;

  let title = "Your StackAudit Report | AI Spend Optimization";
  let description =
    "See your AI stack optimization score, estimated savings, and personalized recommendations from StackAudit.";

  try {
    const report = await fetchReport(id);
    if (report) {
      const savings = Math.round(report.monthlyWaste);
      const toolCount = report.input.tools.length;
      title = `AI Audit — Score ${report.score}/100 · $${savings.toLocaleString()}/mo savings | StackAudit`;
      description = `Your AI stack of ${toolCount} tool${toolCount !== 1 ? "s" : ""} scored ${report.score}/100. Estimated recoverable savings: $${savings.toLocaleString()}/month.`;
    }
  } catch {}

  return {
    title,
    description,
    openGraph: {
      type: "website",
      url: reportUrl,
      title,
      description,
      siteName: "StackAudit",
      images: [
        {
          url: `${baseUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "StackAudit — AI Spend Optimization Report",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-default.png`],
    },
    alternates: { canonical: reportUrl },
  };
}

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
