"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MailCheck, MailX, ShieldQuestion, ThumbsUp, Trash2 } from 'lucide-react';
import { unsubscribeUser } from './actions';

function UnsubscribePage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'confirm' | 'submitting' | 'success' | 'cancelled' | 'error'>('loading');
  const [email, setEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('An unknown error occurred.');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setErrorMessage('No email token provided. Please use the link from your email.');
      setStatus('error');
      return;
    }

    try {
      const decodedEmail = atob(token);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(decodedEmail)) {
        throw new Error('Invalid email format');
      }
      setEmail(decodedEmail);
      setStatus('confirm');
    } catch (e) {
      setErrorMessage('Invalid or corrupted token. The link may have expired or been tampered with.');
      setStatus('error');
    }
  }, [searchParams]);

  const handleUnsubscribe = async () => {
    if (!email) return;
    setStatus('submitting');
    try {
      const result = await unsubscribeUser(email);
      if (result.success) {
        setStatus('success');
      } else {
        setErrorMessage(result.message);
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Failed to communicate with the server. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const handleCancel = () => {
    setStatus('cancelled');
  };

  const StateCard = ({ icon, title, description, children }: { icon: React.ReactNode, title: string, description?: string, children?: React.ReactNode }) => (
    <Card className="w-full max-w-md text-center animate-in fade-in-50 zoom-in-95 duration-500">
      <CardHeader>
        {icon}
        <CardTitle className="pt-4">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent>{children}</CardContent>}
    </Card>
  );

  switch (status) {
    case 'loading':
    case 'submitting':
      return (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">{status === 'loading' ? 'Verifying your request...' : 'Processing your request...'}</p>
        </div>
      );
    case 'error':
      return (
        <StateCard
          icon={<div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit"><MailX className="h-10 w-10 text-destructive" /></div>}
          title="Error Processing Request"
        >
          <p className="text-destructive">{errorMessage}</p>
        </StateCard>
      );
    case 'confirm':
      return (
        <Card className="w-full max-w-md text-center animate-in fade-in-50 zoom-in-95 duration-500">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
              <ShieldQuestion className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="pt-4">Unsubscribe Confirmation</CardTitle>
            <CardDescription>Do you really want to unsubscribe the following email address from our mailing list?</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-lg bg-muted py-3 px-4 rounded-md break-all">{email}</p>
          </CardContent>
          <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={handleUnsubscribe} variant="destructive" size="lg" className="transition-transform transform hover:scale-105">
              <Trash2 className="mr-2 h-5 w-5" /> Yes, Unsubscribe
            </Button>
            <Button onClick={handleCancel} variant="outline" size="lg" className="transition-transform transform hover:scale-105">
              <ThumbsUp className="mr-2 h-5 w-5" /> No, Keep Me
            </Button>
          </CardFooter>
        </Card>
      );
    case 'success':
      return (
        <StateCard
          icon={<div className="mx-auto bg-primary/10 p-4 rounded-full w-fit"><MailCheck className="h-10 w-10 text-primary" /></div>}
          title="Successfully Unsubscribed!"
          description="You have been removed from our mailing list. You will no longer receive emails from us at:"
        >
           <p className="font-semibold text-lg bg-muted py-3 px-4 rounded-md break-all">{email}</p>
        </StateCard>
      );
    case 'cancelled':
      return (
        <StateCard
          icon={<div className="mx-auto bg-accent/20 p-4 rounded-full w-fit"><ThumbsUp className="h-10 w-10 text-accent-foreground" /></div>}
          title="No Action Taken"
          description="Great! You will continue to receive our emails at:"
        >
           <p className="font-semibold text-lg bg-muted py-3 px-4 rounded-md break-all">{email}</p>
        </StateCard>
      );
    default:
      return null;
  }
}

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <Suspense fallback={<Loader2 className="h-12 w-12 animate-spin text-primary" />}>
        <UnsubscribePage />
      </Suspense>
    </main>
  );
}
