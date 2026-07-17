import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground leading-7">
          <p>
            By using toolboxx, you agree to use the platform responsibly and lawfully.
          </p>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Acceptable use</h3>
            <p>
              You may use toolboxx for personal, educational, and professional purposes. Do not misuse the services for harmful, illegal, or abusive activities.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Intellectual property</h3>
            <p>
              The content and design of toolboxx are owned by the platform unless otherwise stated. Please do not copy or redistribute content without permission.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Limitation of liability</h3>
            <p>
              toolboxx is provided as-is. We do our best to keep the service reliable, but we cannot guarantee uninterrupted access or perfect accuracy for every tool.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Changes</h3>
            <p>
              We may update these terms from time to time. Continued use of the site means you accept the latest version.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
