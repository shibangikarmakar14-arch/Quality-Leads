"use client";

import LegalShell, { LegalSection, LegalList } from "@/components/legal-shell";

export default function RefundPage() {
  return (
    <LegalShell title="Refund Policy" updated="August 7, 2026">
      <LegalSection number={1} title="Free Plan">
        <p>Quality Leads offers a Free plan with no payment required. No refund applies to Free plan usage.</p>
      </LegalSection>

      <LegalSection number={2} title="Paid Subscriptions">
        <LegalList items={[
          <><strong>Monthly plans:</strong> We do not offer prorated refunds for cancellations mid-billing-cycle. You will retain access to paid features until the end of the current billing period after cancellation.</>,
          <><strong>Annual plans (if offered):</strong> Refund requests made within 7 days of initial purchase will be considered on a case-by-case basis. Requests made after this window are not eligible for refund.</>
        ]} />
      </LegalSection>

      <LegalSection number={3} title="Billing Errors">
        <p>If you believe you were charged in error (e.g., duplicate charge, incorrect amount), contact us at <a className="text-teal-700 underline hover:text-teal-800" href="mailto:shibangikarmakar14@gmail.com">shibangikarmakar14@gmail.com</a> within 30 days of the charge for review and correction.</p>
      </LegalSection>

      <LegalSection number={4} title="Service Issues">
        <p>If the Service is materially unavailable or non-functional for an extended period due to an issue on our end, contact us to discuss a partial credit or refund on a case-by-case basis.</p>
      </LegalSection>

      <LegalSection number={5} title="How to Request a Refund">
        <p>Email <a className="text-teal-700 underline hover:text-teal-800" href="mailto:shibangikarmakar14@gmail.com">shibangikarmakar14@gmail.com</a> with your account email and reason for the request. We aim to respond within 3-5 business days.</p>
      </LegalSection>

      <LegalSection number={6} title="Non-Refundable Circumstances">
        <p>Refunds will not be issued for:</p>
        <LegalList items={[
          "Dissatisfaction with third-party data accuracy or coverage (see Terms of Service, Section 6)",
          "Accounts terminated for violation of our Terms of Service",
          "Change of mind after the refund eligibility window has passed"
        ]} />
      </LegalSection>

      <LegalSection number={7} title="Contact">
        <p>Questions about this Refund Policy? Contact us at <a className="text-teal-700 underline hover:text-teal-800" href="mailto:shibangikarmakar14@gmail.com">shibangikarmakar14@gmail.com</a>.</p>
      </LegalSection>
    </LegalShell>
  );
}

