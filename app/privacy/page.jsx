'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className='container max-w-3xl px-4 py-12 mx-auto'>
      <h1 className='mb-8 text-4xl font-bold'>Privacy Policy</h1>

      <div className='prose max-w-none'>
        <p className='mb-6 text-gray-600'>Last updated: {new Date().toLocaleDateString()}</p>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>1. Information We Collect</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>Account Information:</strong> Name, email, phone number, location (for lawyer matching)
            </li>
            <li>
              <strong>Professional Details:</strong> For lawyers - credentials, certifications, specializations
            </li>
            <li>
              <strong>Legal Queries:</strong> Chat logs with AI/lawyers (anonymized unless shared with lawyer)
            </li>
            <li>
              <strong>Payment Information:</strong> Processed securely through Stripe
            </li>
            <li>
              <strong>Usage Data:</strong> IP address, browser type, device information
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>2. How We Use Your Data</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Provide AI-assisted legal information</li>
            <li>Match clients with appropriate lawyers</li>
            <li>Process payments and subscriptions</li>
            <li>Improve AI responses using anonymized data</li>
            <li>Send important updates and notifications</li>
            <li>Maintain platform security</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>3. Data Security</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li><strong>Storage:</strong> Secure cloud storage via Supabase</li>
            <li><strong>Encryption:</strong> Industry-standard encryption for all data</li>
            <li><strong>Access Controls:</strong> Strict authentication and authorization</li>
            <li><strong>Regular Audits:</strong> Security and compliance monitoring</li>
            <li><strong>Breach Protocol:</strong> Notification within 72 hours</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>4. Data Sharing</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li><strong>Lawyers:</strong> Only with explicit client consent</li>
            <li><strong>Service Providers:</strong> Payment processing, cloud storage</li>
            <li><strong>Legal Requirements:</strong> When legally obligated</li>
            <li><strong>Analytics:</strong> Anonymized data for service improvement</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>5. Your Rights</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Access and download your data</li>
            <li>Correct or update information</li>
            <li>Delete your account and data</li>
            <li>Opt-out of communications</li>
            <li>Control cookie preferences</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>6. Children's Privacy</h2>
          <p className='text-gray-600'>
            Our services are strictly for users <strong>18 years or older</strong>. We do not knowingly collect data from minors.
          </p>
        </section>

        <section className='pt-8 mt-12 border-t'>
          <p className='text-gray-600'>
            Questions about privacy? Contact us at{' '}
            <a href='mailto:privacy@lawbud.com' className='text-primary hover:underline'>
              privacy@lawbud.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
