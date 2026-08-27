import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";

export const metadata = { title: "إخلاء المسؤولية" };

export default function DisclaimerPage() {
  return <LegalArticle doc={getDocument("disclaimer")} />;
}
