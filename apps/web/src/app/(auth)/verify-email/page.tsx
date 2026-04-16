import { Suspense } from 'react';
import { VerifyEmailForm } from './verify-email-form';

function VerifyEmailFallback() {
  return (
    <div className="text-center max-w-lg w-full">
      <div className="text-5xl mb-4">📧</div>
      <p className="text-[#6B7280] text-sm">Chargement…</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
