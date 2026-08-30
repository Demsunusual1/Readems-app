import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="landing">
      <nav className="brand">
        <span className="brand-mark">R</span>
        <b>Readems</b>
        <Link href="/signup" className="small-button">
          Sign up
        </Link>
      </nav>
      <section className="hero">
        <div>
          <p className="eyebrow">Stories belong to everyone</p>
          <h1>
            Stories That
            <br />
            Move the World
          </h1>
          <p>
            Read captivating stories. Share your voice. Build community. Earn as
            a creator.
          </p>
          <Link href="/signup" className="primary-button">
            Start your story
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span>“</span>
          <p>Words have the power to heal, inspire, and change everything.</p>
        </div>
      </section>
    </main>
  );
}
