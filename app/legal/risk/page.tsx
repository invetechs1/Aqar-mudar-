import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";

export const metadata = { title: "إفصاح مخاطر الاستثمار" };

export default function RiskPage() {
  return <LegalArticle doc={getDocument("risk")} />;
}
