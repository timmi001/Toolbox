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
          <p>
            toolboxx is committed to protecting your privacy. This page explains what information we collect and how we use it.
          </p>
          <div>
            <h3 className="font-semibold text-foreground mb-2">What we collect</h3>
            <p>
              Most tools on toolboxx run entirely in your browser. We do not collect your files, text, or generated content unless you explicitly choose to share it with us.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">How we use information</h3>
            <p>
              Any contact form submissions or feedback you send are used only to respond to your message and improve the platform.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Cookies and analytics</h3>
            <p>
              We may use basic analytics tools to understand general traffic patterns and improve user experience. These tools do not identify you personally.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Contact</h3>
            <p>
              If you have questions about privacy, please contact us at hello@toolboxx.com.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
