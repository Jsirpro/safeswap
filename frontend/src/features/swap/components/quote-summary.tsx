'use client';

export function QuoteSummary({ quote }: { quote: any }) {
  if (!quote) return null;
  return (
    <section>
      <h3>Quote</h3>
      <p>Expected: {quote.expectedOutputAmount}</p>
      <p>Minimum: {quote.minimumOutputAmount}</p>
      <p>Route: {quote.routeSummary}</p>
    </section>
  );
}
