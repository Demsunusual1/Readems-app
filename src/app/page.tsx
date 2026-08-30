export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section aria-labelledby="page-title">
        <p className="text-sm font-medium text-slate-600">Foundation ready</p>
        <h1
          id="page-title"
          className="mt-2 text-4xl font-semibold tracking-tight text-slate-950"
        >
          Readems
        </h1>
        <p className="mt-4 max-w-prose text-base leading-7 text-slate-700">
          The application foundation is in place. Product functionality will be
          added in a future iteration.
        </p>
      </section>
    </main>
  );
}
