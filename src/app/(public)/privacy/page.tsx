export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300 px-6 py-16">
      <div className="max-w-3xl mx-auto prose prose-invert">
        <h1>Privacy Policy</h1>
        <p>We collect only what we need: your Reddit username, email, KYC info via Stripe, and IP addresses for fraud detection. We never sell your data.</p>
        <h2>IP Logging</h2>
        <p>We log IP addresses on meaningful events (login, claim, submit, withdrawal) to detect multi-account fraud. IP logs are retained for 12 months.</p>
      </div>
    </main>
  );
}
