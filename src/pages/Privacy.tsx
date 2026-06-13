import { Navbar } from '@/components/Navbar'

export function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <h1 className="mb-8 text-4xl font-bold text-text">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none text-text-muted space-y-6">
          <p className="text-sm text-text-dim">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-text mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, submit prompts for software architecture, or communicate with us.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-text mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, including generating architecture designs and training our models to provide better results.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-text mb-3">3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect the security of your personal information against unauthorized access or disclosure.</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-text mb-3">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@foundryforge.ai" className="text-primary hover:underline">privacy@foundryforge.ai</a>.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
