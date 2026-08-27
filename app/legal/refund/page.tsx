import { LegalArticle } from "@/components/LegalArticle";
import { getDocument } from "@/lib/legal-docs";

export const metadata = { title: "سياسة الرسوم والاسترداد" };

export default function RefundPage() {
  return <LegalArticle doc={getDocument("refund")} />;
}
