export default function PrivacyPolicyPage() {
  return (
    <div className='container max-w-3xl px-4 py-12 mx-auto'>
      <h1 className='mb-8 text-4xl font-bold'>Privacy Policy</h1>

      <div className='prose max-w-none'>
        <p className='mb-6 text-gray-600'>Last updated: February 2025</p>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>1. What We Collect</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>Personal Data:</strong> Name, email, phone number,
              location (to match lawyers)
            </li>
            <li>
              <strong>Legal Queries:</strong> Chat logs with AI/lawyers
              (anonymized unless you opt to share with a lawyer)
            </li>
            <li>
              <strong>Payment Data:</strong> Secured via PCI-compliant gateways
            </li>
            <li>
              <strong>Device/Usage Data:</strong> IP, browser type, cookies (to
              improve services)
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>
            2. How We Use Your Data
          </h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Provide AI answers and connect you with lawyers</li>
            <li>
              Improve AI accuracy using anonymized queries (no personal ID
              linked)
            </li>
            <li>Send updates/promos (opt-out anytime)</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>3. Sharing & Security</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>Lawyers:</strong> Only share your case details with your
              consent
            </li>
            <li>
              <strong>Third Parties:</strong> Never sell data. Only trusted
              vendors
            </li>
            <li>
              <strong>Security:</strong> AES-256 encryption, annual audits, and
              breach notifications within 72 hours
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>4. Your Rights</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Access, delete, or correct your data via Settings</li>
            <li>
              Withdraw consent for AI training (email{' '}
              <a
                href='mailto:support@lawbud.com'
                className='text-primary hover:underline'
              >
                support@lawbud.com
              </a>
              )
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>5. Children's Privacy</h2>
          <p className='text-gray-600'>
            Our services are strictly for users{' '}
            <strong>18 years or older</strong>.
          </p>
        </section>

        <section className='pt-8 mt-12 border-t'>
          <p className='text-gray-600'>
            Questions about our privacy policy? Contact us at{' '}
            <a
              href='mailto:privacy@lawbud.com'
              className='text-primary hover:underline'
            >
              privacy@lawbud.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
