export default function TermsOfServicePage() {
  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <div className="prose dark:prose-invert">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2>Acceptance of Terms</h2>
        <p>
          By accessing and using Anitale, you accept and agree to be bound by the terms and provision of this agreement. 
          If you do not agree to abide by these terms, please do not use this service.
        </p>
        <h2>Service Description</h2>
        <p>
          Anitale is an informational aggregator and mediator. We provide metadata, trailers, and links to official, 
          legal platforms where you can watch media content. We do not host, store, or distribute copyrighted media files.
        </p>
        <h2>User Conduct</h2>
        <p>
          Users must not use the site for any unlawful purpose. Harassment, abusive language, or spamming in our 
          community features (like reviews and discussions) will result in account termination.
        </p>
        <h2>Disclaimer of Warranties</h2>
        <p>
          The service is provided on an "as is" and "as available" basis without any warranties of any kind. 
          We do not guarantee the accuracy or availability of external links provided on our site.
        </p>
      </div>
    </div>
  );
}
