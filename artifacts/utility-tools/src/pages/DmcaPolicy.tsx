import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DmcaPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">DMCA & Copyright Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-muted-foreground leading-7">
          <p>
            toolboxx respects the intellectual property rights of others and expects users to do the same.
          </p>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Reporting copyright infringement</h3>
            <p>
              If you believe that content on our site infringes your copyright, please contact us at hello@toolboxx.com with a detailed notice that includes the location of the material, your contact information, and a statement that the use is unauthorized.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Review process</h3>
            <p>
              We review all valid notices promptly and may remove or disable access to material that appears to violate copyright law.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Counter-notice</h3>
            <p>
              If you believe content was removed in error, you may submit a counter-notice with your contact information and a statement under penalty of perjury that the material was removed by mistake or misidentification.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Contact</h3>
            <p>
              For any questions about this policy, please reach out to hello@toolboxx.com.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
