export default function AboutPage() {
  return (
    <div className='container max-w-3xl px-4 py-12 mx-auto'>
      <h1 className='mb-8 text-4xl font-bold'>About Lawbud</h1>

      <div className='prose max-w-none'>
        <section className='mb-12'>
          <h2 className='mb-4 text-2xl font-semibold'>Our Mission</h2>
          <p className='mb-6 text-gray-600'>
            Lawbud exists to democratize legal access in India. We bridge the
            gap between confusing laws and actionable solutions through AI
            simplicity and human expertise.
          </p>
        </section>

        <section className='mb-12'>
          <h2 className='mb-4 text-2xl font-semibold'>What Sets Us Apart</h2>
          <ul className='pl-6 space-y-4 text-gray-600 list-disc'>
            <li>
              <strong>AI Precision:</strong> Our AI is trained on Bhartiya Nyay
              Sanhita, IT Act, and extensive case studies to provide accurate,
              contextual legal information
            </li>
            <li>
              <strong>Expert Network:</strong> Access to verified lawyers across
              multiple specializations
            </li>
            <li>
              <strong>Privacy First:</strong> Your identity and information
              remain protected until you choose to share
            </li>
            <li>
              <strong>Accessibility:</strong> Legal help shouldn't require a
              premium budget
            </li>
          </ul>
        </section>

        <section className='mb-12'>
          <h2 className='mb-4 text-2xl font-semibold'>Our Commitment</h2>
          <div className='space-y-4 text-gray-600'>
            <p>
              We're committed to making legal assistance accessible, affordable,
              and understandable for everyone in India. Our platform combines
              cutting-edge AI technology with human expertise to provide
              reliable legal guidance.
            </p>
            <p>
              Whether you're seeking quick legal information or need to connect
              with a qualified lawyer, Lawbud is here to help you navigate the
              legal landscape with confidence.
            </p>
          </div>
        </section>

        <section className='pt-8 mt-12 border-t'>
          <h2 className='mb-4 text-2xl font-semibold'>Contact Us</h2>
          <p className='text-gray-600'>
            Have questions or suggestions? We'd love to hear from you at{' '}
            <a
              href='mailto:contact@Lawbud.com'
              className='text-primary hover:underline'
            >
              contact@Lawbud.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
