'use client';

export function PreviewCard({ preview }: { preview: any }) {
  if (!preview) return null;
  return (
    <section>
      <h3>Preview</h3>
      <p>{preview.walletOutflowText}</p>
      <p>{preview.walletInflowText}</p>
      <p>{preview.expectedOutputText}</p>
      <p>{preview.minimumOutputText}</p>
      <p>{preview.routeText}</p>
      <p>{preview.failureConditionsText}</p>
      {preview.guardianFindingsText.map((line: string) => <p key={line}>{line}</p>)}
    </section>
  );
}
