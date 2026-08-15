import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground leading-7">
          <p className="font-semibold">Last Updated: August 14, 2026</p>

          <p>
            Welcome to Toolbuxx ("Toolbuxx", "we", "us", or "our"). This Privacy Policy explains how we collect, use, store, share, and protect information when you use our website and services.
          </p>

          <p>By using Toolbuxx, you agree to the practices described in this Privacy Policy.</p>

          <h3 className="font-semibold text-foreground">1. INFORMATION WE COLLECT</h3>
          <p>We may collect information automatically when you visit or use Toolbuxx, including:</p>
          <ul className="list-disc ml-6">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device type</li>
            <li>Operating system</li>
            <li>Approximate geographic location</li>
            <li>Pages and tools visited</li>
            <li>Referring website</li>
            <li>Date and time of visits</li>
            <li>Usage and interaction information</li>
            <li>Cookies and similar technologies</li>
          </ul>
          <p>If you voluntarily provide information through a feature of Toolbuxx, such as an email address, we may collect that information for the specific purpose for which it was provided.</p>
          <p>We do not intentionally collect sensitive personal information unless it is necessary to provide a specific service and you voluntarily provide it.</p>

          <h3 className="font-semibold text-foreground">2. HOW WE USE INFORMATION</h3>
          <p>We may use information to:</p>
          <ul className="list-disc ml-6">
            <li>Provide and operate Toolbuxx</li>
            <li>Improve our tools and services</li>
            <li>Monitor website performance</li>
            <li>Detect fraud, abuse, and security threats</li>
            <li>Understand how visitors use the website</li>
            <li>Analyze traffic and usage</li>
            <li>Personalize content where permitted</li>
            <li>Deliver and measure advertising</li>
            <li>Maintain and improve website functionality</li>
            <li>Respond to support requests</li>
            <li>Comply with applicable legal obligations</li>
          </ul>

          <h3 className="font-semibold text-foreground">3. COOKIES AND SIMILAR TECHNOLOGIES</h3>
          <p>Toolbuxx and third-party service providers may use cookies, local storage, pixels, tags, and similar technologies.</p>
          <p>These technologies may be used for:</p>
          <ul className="list-disc ml-6">
            <li>Essential website functionality</li>
            <li>Analytics</li>
            <li>Security</li>
            <li>Advertising</li>
            <li>Measuring advertising performance</li>
            <li>Personalization</li>
          </ul>
          <p>Where legally required, we request your consent before using non-essential cookies or similar technologies. You may change or withdraw your privacy choices through the privacy and consent controls provided on our website.</p>

          <h3 className="font-semibold text-foreground">4. ADVERTISING</h3>
          <p>Toolbuxx may use third-party advertising providers, including Google AdSense and other advertising partners, to display advertisements.</p>
          <p>These providers may use cookies, advertising identifiers, IP addresses, and similar technologies to provide, measure, personalize, or limit advertisements, subject to applicable consent and privacy requirements. Google and other advertising providers may process information according to their respective privacy policies.</p>
          <p>For users in the European Economic Area, United Kingdom, and Switzerland, Toolbuxx may use a consent mechanism designed to comply with applicable consent requirements for personalized advertising.</p>

          <h3 className="font-semibold text-foreground">5. ANALYTICS</h3>
          <p>We may use analytics services to understand how visitors use Toolbuxx. Analytics information may include pages viewed, traffic source, device type, browser, approximate location, and session and interaction information. Analytics information is used to improve the website and understand overall usage.</p>

          <h3 className="font-semibold text-foreground">6. THIRD-PARTY SERVICES</h3>
          <p>Toolbuxx may use third-party providers for services such as hosting, analytics, advertising, AI services, email, authentication, security, payment processing, and content delivery. These providers may process information according to their own privacy policies and applicable agreements. We do not sell personal information simply for the purpose of selling user data.</p>

          <h3 className="font-semibold text-foreground">7. EUROPEAN PRIVACY RIGHTS — GDPR</h3>
          <p>If you are located in the European Economic Area, you may have rights under the GDPR, including rights to access, correct, delete, restrict processing, object to certain processing, data portability, withdraw consent, and lodge a complaint with a data protection authority. The legal basis for processing may include consent, contractual necessity, legitimate interests, and compliance with legal obligations. Where processing relies on consent, you may withdraw consent at any time.</p>

          <h3 className="font-semibold text-foreground">8. UK PRIVACY RIGHTS</h3>
          <p>If you are located in the United Kingdom, you may have rights under applicable UK data-protection legislation, including rights to access, correct, delete, restrict processing, object, portability, and withdrawal of consent where applicable.</p>

          <h3 className="font-semibold text-foreground">9. CALIFORNIA PRIVACY RIGHTS — CCPA/CPRA</h3>
          <p>If you are a California resident and the CCPA/CPRA applies, you may have rights including the right to know what personal information we collect and how it is used, request deletion, correct inaccurate personal information, opt out of the sale or sharing of personal information, limit certain uses and disclosures of sensitive personal information, and non-discrimination for exercising applicable privacy rights. California residents may also use applicable browser-based Global Privacy Control (GPC) signals where required. These rights are subject to applicable legal exceptions and verification requirements.</p>
          <p><strong>DO NOT SELL OR SHARE MY PERSONAL INFORMATION</strong></p>
          <p>Where applicable, California residents can exercise their right to opt out of the sale or sharing of personal information through the "Do Not Sell or Share My Personal Information" mechanism provided on Toolbuxx.</p>

          <h3 className="font-semibold text-foreground">10. OTHER US STATE PRIVACY LAWS</h3>
          <p>Depending on where you live and whether applicable thresholds are met, you may have privacy rights under other US state privacy laws. These may include rights relating to access, correction, deletion, data portability, opting out of targeted advertising, opting out of certain data sales or sharing, and certain profiling activities. We will process valid privacy requests in accordance with applicable law.</p>

          <h3 className="font-semibold text-foreground">11. CHILDREN'S PRIVACY</h3>
          <p>Toolbuxx is not intended to knowingly collect personal information from children in violation of applicable laws. If you believe a child has provided personal information to us improperly, please contact us so that we can investigate and take appropriate action.</p>

          <h3 className="font-semibold text-foreground">12. DATA RETENTION</h3>
          <p>We retain information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including providing services, maintaining security, resolving disputes, complying with legal obligations, and enforcing agreements. Retention periods may vary depending on the type of information and the purpose for which it was collected.</p>

          <h3 className="font-semibold text-foreground">13. DATA SECURITY</h3>
          <p>We use reasonable technical and organizational measures designed to protect information against unauthorized access, loss, misuse, alteration, or disclosure. However, no internet transmission or storage system can be guaranteed to be completely secure.</p>

          <h3 className="font-semibold text-foreground">14. INTERNATIONAL DATA TRANSFERS</h3>
          <p>Because Toolbuxx may use service providers located in different countries, information may be processed outside your country of residence. Where required by applicable law, appropriate safeguards will be used for international transfers of personal information.</p>

          <h3 className="font-semibold text-foreground">15. YOUR PRIVACY CHOICES</h3>
          <p>You may:</p>
          <ul className="list-disc ml-6">
            <li>Disable cookies through your browser</li>
            <li>Manage advertising preferences through available consent controls</li>
            <li>Withdraw consent where applicable</li>
            <li>Use applicable privacy-control signals such as Global Privacy Control</li>
            <li>Contact us to exercise applicable privacy rights</li>
          </ul>
          <p>For Google advertising, Google provides additional controls regarding advertising personalization and privacy choices.</p>

          <h3 className="font-semibold text-foreground">16. EXERCISING YOUR PRIVACY RIGHTS</h3>
          <p>To request access, correction, deletion, or other applicable privacy rights, contact us at:</p>
          <p className="font-semibold">Email: privacy@toolbuxx.site</p>
          <p>Please include enough information for us to understand and verify your request. We may need to verify your identity before completing certain requests.</p>

          <h3 className="font-semibold text-foreground">17. CHANGES TO THIS PRIVACY POLICY</h3>
          <p>We may update this Privacy Policy periodically to reflect changes to Toolbuxx, our services, applicable laws, or our privacy practices. The "Last Updated" date at the top of this page indicates when this policy was most recently updated.</p>

          <h3 className="font-semibold text-foreground">18. CONTACT US</h3>
          <p>If you have questions about this Privacy Policy or our privacy practices, contact:</p>
          <p className="font-semibold">Toolbuxx</p>
          <p className="font-semibold">Email: privacy@toolbuxx.site</p>
          <p className="font-semibold">Website: https://www.toolbuxx.site</p>
        </CardContent>
      </Card>
    </div>
  );
}
