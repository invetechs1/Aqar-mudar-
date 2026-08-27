import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";

export const metadata = { title: "AML / KYC" };

export default function AMLPage() {
  return <LegalArticle doc={getDocument("aml")} />;
}
