export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose dark:prose-invert">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p>
          At Anitale, we take your privacy seriously. This Privacy Policy outlines the types of personal information 
          we collect, how it is used, and how we protect your data.
        </p>
        <h2>Information Collection</h2>
        <p>
          We may collect information you provide directly to us when you create an account, leave a review, 
          or interact with our community features. We also collect anonymous usage data to improve our services.
        </p>
        <h2>Google AdSense</h2>
        <p>
          We use Google AdSense to display ads. Google may use cookies to serve ads based on your prior visits to our 
          website or other websites. You can opt out of personalized advertising by visiting Google's Ads Settings.
        </p>
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@anitale.com.
        </p>
      </div>
    </div>
  );
}
