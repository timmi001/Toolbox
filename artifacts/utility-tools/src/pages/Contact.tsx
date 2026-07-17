import { Link } from 'wouter';
import { ArrowLeft, Mail, MessageSquareText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Contact us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground leading-7">
          <p>
            We would love to hear from you. Whether you want to share feedback, report an issue, or suggest a new tool, reach out below.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span>hello@toolboxx.com</span>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquareText className="h-5 w-5 text-primary" />
              <span>Feedback and support requests are always welcome.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
