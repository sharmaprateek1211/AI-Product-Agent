import Link from "next/link";

export default function Home() {
  return (
    <main>
      <nav className="nav container">
        <div className="brand">ForgeAI</div>

        <Link className="btn secondary" href="/login">
          Login
        </Link>
      </nav>

      <section className="hero container">
        <p className="small">AI WEBSITE → PRODUCT AGENT</p>

        <h1>Turn any website idea into a product blueprint.</h1>

        <p>
          Analyze a website, understand its positioning, generate an MVP
          structure, and refine the concept through natural-language
          instructions.
        </p>

        <Link className="btn" href="/dashboard">
          Build My Product →
        </Link>
      </section>

      <section className="grid container">
        {[
          [
            "Analyze",
            "Understand product, users, problem, features and business model.",
          ],
          [
            "Build",
            "Generate product name, pages, navigation and UI direction.",
          ],
          [
            "Iterate",
            "Tell the AI what to change and update the concept instantly.",
          ],
        ].map(([t, d]) => (
          <div className="card" key={t}>
            <h3>{t}</h3>
            <p className="muted">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}