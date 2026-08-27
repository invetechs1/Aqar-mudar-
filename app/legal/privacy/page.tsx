import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";

export const metadata = { title: "سياسة الخصوصية — PDPL" };

export default function PrivacyPage() {
  return <LegalArticle doc={getDocument("privacy")} />;
}
