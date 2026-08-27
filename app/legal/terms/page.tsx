import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";

export const metadata = { title: "الشروط والأحكام" };

export default function TermsPage() {
  return <LegalArticle doc={getDocument("terms")} />;
}
