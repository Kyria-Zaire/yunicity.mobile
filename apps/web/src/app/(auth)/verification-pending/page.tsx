import { Suspense } from 'react';
import { VerificationPendingContent } from './verification-pending-content';

function VerificationPendingFallback() {
  return (
    <div className="max-w-lg w-full text-center">
      <div className="text-5xl mb-4">📨</div>
      <p className="text-[#6B7280] text-sm">Chargement…</p>
    </div>
  );
}

export default function VerificationPendingPage() {
  return (
    <Suspense fallback={<VerificationPendingFallback />}>
      <VerificationPendingContent />
    </Suspense>
  );
}
