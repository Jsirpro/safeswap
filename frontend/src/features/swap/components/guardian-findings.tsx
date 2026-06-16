'use client';

export function GuardianFindings({ guardian }: { guardian: any }) {
  if (!guardian) return null;
  return (
    <section>
      <h3>Guardian</h3>
      {guardian.findings.length === 0 ? <p>No blocking findings.</p> : guardian.findings.map((finding: any) => <p key={finding.findingId}>{finding.message}</p>)}
    </section>
  );
}
