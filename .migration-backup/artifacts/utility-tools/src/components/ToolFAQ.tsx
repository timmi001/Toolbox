import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface ToolFAQProps {
  faqs: FAQItem[];
}

export function ToolFAQ({ faqs }: ToolFAQProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="my-12">
      <h3 className="text-2xl font-bold mb-6 text-foreground tracking-tight">Frequently Asked Questions</h3>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
            <AccordionTrigger className="text-left font-medium hover:text-primary transition-colors">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
