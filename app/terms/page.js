"use client";

import LegalShell, { LegalSection, LegalList } from "@/components/legal-shell";

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="August 7, 2026">
      <LegalSection number={1} title="Agreement to Terms">
        <p>By accessing or using Quality Leads (“the Service,” “we,” “us,” “our”), operated by <strong>Shibangi Karmakar, Sole Proprietor</strong>, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
      </LegalSection>

      <LegalSection number={2} title="Description of Service">
        <p>Quality Leads provides sales intelligence tools including prospect search, company research, AI-assisted outreach drafting, and pipeline tracking. Lead and profile data is sourced from third-party data providers and is provided “as is” — we do not guarantee the accuracy, completeness, or currency of any third-party data displayed through the Service.</p>
      </LegalSection>

      <LegalSection number={3} title="Account Registration">
        <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.</p>
      </LegalSection>

      <LegalSection number={4} title="Subscription Plans and Billing">
        <p>Quality Leads offers a Free plan and paid subscription plans (Pro, Team) as described on our Pricing page.</p>
        <LegalList items={[
          "Paid subscriptions are billed in advance on a recurring monthly (or annual, if selected) basis via our payment processor.",
          "Prices are subject to change with at least 30 days' notice to active subscribers.",
          "You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period."
        ]} />
      </LegalSection>

      <LegalSection number={5} title="Acceptable Use">
        <p>You agree not to:</p>
        <LegalList items={[
          "Use the Service to harass, spam, or send unsolicited bulk communications in violation of applicable law (including CAN-SPAM, GDPR, or similar regulations in your jurisdiction)",
          "Attempt to scrape, reverse-engineer, or resell data obtained through the Service in bulk",
          "Use the Service for any unlawful purpose",
          "Share your account credentials with unauthorized third parties"
        ]} />
      </LegalSection>

      <LegalSection number={6} title="Data Accuracy Disclaimer">
        <p>Prospect and company data is sourced from third-party providers and public sources. We do not guarantee that any contact, title, or company information is current or accurate. You are responsible for verifying information before relying on it for business decisions or outreach.</p>
      </LegalSection>

      <LegalSection number={7} title="Intellectual Property">
        <p>All software, design, and content on the Service (excluding third-party data) are owned by Shibangi Karmakar. You may not copy, modify, or redistribute the Service without written permission.</p>
      </LegalSection>

      <LegalSection number={8} title="Limitation of Liability">
        <p>To the maximum extent permitted by law, Shibangi Karmakar shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to lost business opportunities or inaccurate lead data.</p>
      </LegalSection>

      <LegalSection number={9} title="Termination">
        <p>We reserve the right to suspend or terminate accounts that violate these Terms, without refund of unused subscription time in cases of violation.</p>
      </LegalSection>

      <LegalSection number={10} title="Changes to Terms">
        <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
      </LegalSection>

      <LegalSection number={11} title="Governing Law">
        <p>These Terms are governed by the laws of India, without regard to conflict of law principles.</p>
      </LegalSection>

      <LegalSection number={12} title="Contact">
        <p>Questions about these Terms? Contact us at <a className="text-teal-700 underline hover:text-teal-800" href="mailto:shibangikarmakar14@gmail.com">shibangikarmakar14@gmail.com</a>.</p>
      </LegalSection>
    </LegalShell>
  );
}

