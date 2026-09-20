
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaqItem } from "@/lib/public-listing";

type Props = {
  faqs: FaqItem[];
};

const ListingFaqs = ({ faqs }: Props) => {
  if (!faqs?.length) return null;

  return (
    <Accordion
      defaultValue={["faq-0"]}
      className="w-full"
    >
      {faqs.map((faq, index) => (
        <AccordionItem
          key={`${faq.question}-${index}`}
          value={`faq-${index}`}
          className="border-b border-[#e5ece9] last:border-b-0"
        >
          <AccordionTrigger className="py-5 text-left text-sm font-bold text-[#31594c] hover:no-underline">
            {faq.question}
          </AccordionTrigger>

          <AccordionContent className="max-w-3xl pb-5 text-sm leading-7 text-[#71867e]">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ListingFaqs;
