/** Retire les clés R2 des documents KYC avant exposition API (A02). */
export function sanitizeUserForApi(user: unknown): unknown {
  const u = user as Record<string, unknown>;
  const vs = u['verificationStatus'] as
    | { documents?: Array<Record<string, unknown>> }
    | undefined;
  const docs = vs?.documents;
  if (!Array.isArray(docs)) return user;

  const stripped = docs.map((d) => {
    const { r2Key: _r, ...rest } = d;
    return rest;
  });

  return {
    ...u,
    verificationStatus: {
      ...vs,
      documents: stripped,
    },
  };
}
