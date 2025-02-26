'use client';

export default function LawyerAgreementPage() {
  return (
    <div className='container max-w-3xl px-4 py-12 mx-auto'>
      <h1 className='mb-8 text-4xl font-bold'>Lawyer Agreement</h1>

      <div className='prose max-w-none'>
        <p className='mb-6 text-gray-600'>Last updated: {new Date().toLocaleDateString()}</p>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>1. Professional Standards</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>Qualifications:</strong> Must maintain valid legal license and good standing with bar association
            </li>
            <li>
              <strong>Documentation:</strong> Provide and keep updated all required certifications and credentials
            </li>
            <li>
              <strong>Verification:</strong> Submit to platform's verification process and periodic reviews
            </li>
            <li>
              <strong>Insurance:</strong> Maintain professional liability insurance coverage
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>2. Service Commitments</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>Response Time:</strong> Respond to client inquiries within 24 hours
            </li>
            <li>
              <strong>Availability:</strong> Keep calendar and availability status updated
            </li>
            <li>
              <strong>Communication:</strong> Maintain professional communication standards
            </li>
            <li>
              <strong>Quality:</strong> Provide high-quality legal services consistently
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>3. Platform Usage</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>Client Communication:</strong> Use platform's messaging system for all client interactions
            </li>
            <li>
              <strong>Document Handling:</strong> Maintain confidentiality in document sharing
            </li>
            <li>
              <strong>Profile Management:</strong> Keep profile information accurate and current
            </li>
            <li>
              <strong>Rating System:</strong> Participate in platform's rating and review system
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>4. Financial Terms</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>Platform Fees:</strong> Commission structure on successful client engagements
            </li>
            <li>
              <strong>Payment Processing:</strong> All payments handled through platform
            </li>
            <li>
              <strong>Payout Schedule:</strong> Regular payment transfers for completed services
            </li>
            <li>
              <strong>Dispute Resolution:</strong> Financial dispute handling procedures
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>5. Confidentiality</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>Client Information:</strong> Maintain strict confidentiality of client data
            </li>
            <li>
              <strong>Data Protection:</strong> Follow platform's security protocols
            </li>
            <li>
              <strong>Communication Security:</strong> Use only secure platform channels
            </li>
            <li>
              <strong>Breach Reporting:</strong> Immediate reporting of any security concerns
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>6. Quality Standards</h2>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>
              <strong>Service Quality:</strong> Maintain minimum rating requirements
            </li>
            <li>
              <strong>Response Rate:</strong> Meet platform's response time standards
            </li>
            <li>
              <strong>Client Satisfaction:</strong> Address client feedback professionally
            </li>
            <li>
              <strong>Professional Development:</strong> Stay updated in practice areas
            </li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>7. Compliance</h2>
          <p className='mb-4 text-gray-600'>Lawyers must maintain:</p>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Compliance with local bar association rules</li>
            <li>Adherence to professional ethics guidelines</li>
            <li>Platform-specific compliance requirements</li>
            <li>Updated professional credentials</li>
          </ul>
        </section>

        <section className='mb-8'>
          <h2 className='mb-4 text-2xl font-semibold'>8. Termination</h2>
          <p className='mb-4 text-gray-600'>Agreement may be terminated for:</p>
          <ul className='pl-6 space-y-2 text-gray-600 list-disc'>
            <li>Professional misconduct</li>
            <li>Consistent poor performance</li>
            <li>Violation of platform terms</li>
            <li>Loss of legal license</li>
          </ul>
        </section>

        <section className='pt-8 mt-12 border-t'>
          <p className='text-gray-600'>
            Questions about the lawyer agreement? Contact us at{' '}
            <a href='mailto:legal@lawbud.com' className='text-primary hover:underline'>
              legal@lawbud.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
} 