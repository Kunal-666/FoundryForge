import { Navbar } from '@/components/Navbar'

export function Documentation() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-32">
        <h1 className="mb-8 text-4xl font-bold text-text">Documentation</h1>
        <div className="prose prose-invert max-w-none text-text-muted">
          <h2 className="text-2xl font-semibold text-text mt-8 mb-4">Getting Started</h2>
          <p className="mb-4">FoundryForge helps you design and structure software architecture using AI. Start by navigating to your dashboard and creating a new project.</p>
          
          <h2 className="text-2xl font-semibold text-text mt-8 mb-4">The Architecture Pipeline</h2>
          <p className="mb-4">Our pipeline consists of 8 main steps:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-text">Requirements Analysis</strong>: Understanding your core needs.</li>
            <li><strong className="text-text">Clarification & Scope</strong>: Defining boundaries and assumptions.</li>
            <li><strong className="text-text">Architecture Design</strong>: Proposing the system components.</li>
            <li><strong className="text-text">Database Summary</strong>: Structuring the data.</li>
            <li><strong className="text-text">Project Structure</strong>: Organizing the files and folders.</li>
            <li><strong className="text-text">Security & Compliance</strong>: Ensuring safety and best practices.</li>
            <li><strong className="text-text">Development Roadmap</strong>: Planning the execution phases.</li>
            <li><strong className="text-text">Code Generation</strong>: Setting up the initial boilerplate.</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
