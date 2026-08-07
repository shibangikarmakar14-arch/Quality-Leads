"use client";

import LegalShell, { LegalSection, LegalList } from "@/components/legal-shell";

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="August 7, 2026">
      <LegalSection number={1} title="Overview">
        <p>This Privacy Policy explains how Quality Leads (“we,” “us,” “our”) collects, uses, and protects information when you use our Service.</p>
      </LegalSection>

      <LegalSection number={2} title="Information We Collect">
        <p><strong>Information you provide:</strong></p>
        <LegalList items={[
          "Name, email address, and password when you create an account",
          "Billing information (processed securely by our payment processor — we do not store full card details)",
          "Search queries and saved preferences within the Service"
        ]} />
        <p><strong>Information from third parties:</strong></p>
        <LegalList items={[
          "Prospect and company data (names, job titles, companies, LinkedIn profile URLs, and related professional information) sourced from PeopleDataLabs, used to power search results"
        ]} />
        <p><strong>Automatically collected information:</strong></p>
        <LegalList items={[
          "Usage data such as pages visited, features used, and general analytics",
          "Device and browser information, IP address"
        ]} />
      </LegalSection>

      <LegalSection number={3} title="How We Use Information">
        <p>We use collected information to:</p>
        <LegalList items={[
          "Provide and improve the Service",
          "Process subscription payments",
          "Communicate with you about your account or updates to the Service",
          "Analyze usage patterns to improve features",
          "Comply with legal obligations"
        ]} />
      </LegalSection>

      <LegalSection number={4} title="Third-Party Data Sources">
        <p>Prospect data displayed through the Service is sourced from <strong>PeopleDataLabs</strong>, which compiles publicly available professional information, and currently includes <strong>name, title, company, and LinkedIn URL only — no email or phone number</strong>. We do not independently verify this data. If you believe your own information is displayed inaccurately or you wish to request removal, contact us at <a className="text-teal-700 underline hover:text-teal-800" href="mailto:shibangikarmakar14@gmail.com">shibangikarmakar14@gmail.com</a> and we will make reasonable efforts to address the request with our data provider.</p>
      </LegalSection>

      <LegalSection number={5} title="Data Sharing">
        <p>We do not sell your personal information. We may share data with:</p>
        <LegalList items={[
          "Payment processors (Razorpay) to process transactions",
          "Analytics providers in aggregated or anonymized form where possible",
          "Law enforcement or regulators, if required by law"
        ]} />
      </LegalSection>

      <LegalSection number={6} title="Data Security">
        <p>We implement reasonable technical and organizational measures to protect your data. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
      </LegalSection>

      <LegalSection number={7} title="Data Retention">
        <p>We retain account information for as long as your account is active. You may request deletion of your account and associated data by contacting <a className="text-teal-700 underline hover:text-teal-800" href="mailto:shibangikarmakar14@gmail.com">shibangikarmakar14@gmail.com</a>.</p>
      </LegalSection>

      <LegalSection number={8} title="Your Rights">
        <p>Depending on your location, you may have rights to access, correct, or delete your personal data, or to object to certain processing. Contact us at <a className="text-teal-700 underline hover:text-teal-800" href="mailto:shibangikarmakar14@gmail.com">shibangikarmakar14@gmail.com</a> to exercise these rights.</p>
      </LegalSection>

      <LegalSection number={9} title="Cookies">
        <p>We use cookies and similar technologies to maintain your session and understand usage patterns. You can control cookie settings through your browser.</p>
      </LegalSection>

      <LegalSection number={10} title="Children's Privacy">
        <p>The Service is not intended for individuals under 18. We do not knowingly collect data from minors.</p>
      </LegalSection>

      <LegalSection number={11} title="Changes to This Policy">
        <p>We may update this Privacy Policy periodically. Material changes will be communicated via email or a notice on the Service.</p>
      </LegalSection>

      <LegalSection number={12} title="Contact">
        <p>Questions about this Privacy Policy? Contact us at <a className="text-teal-700 underline hover:text-teal-800" href="mailto:shibangikarmakar14@gmail.com">shibangikarmakar14@gmail.com</a>.</p>
      </LegalSection>
    </LegalShell>
  );
}

