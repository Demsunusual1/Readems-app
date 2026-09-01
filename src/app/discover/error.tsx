'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main style={{ padding: '3rem', color: '#0f1f3d' }}>
      <h1>Discover couldn’t load</h1>
      <p>Please try again.</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
