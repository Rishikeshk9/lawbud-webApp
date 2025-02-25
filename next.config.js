/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jktfbtlmbakrhzxpitgp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/avatars/**',
      },
    ],
  },
  rewrites: async () => {
    return [
      {
        source: '/api/webhooks/subscriptions/',
        destination: '/api/webhooks/subscriptions',
      },
      {
        source: '/api/webhooks/checkout/',
        destination: '/api/webhooks/checkout',
      },
    ];
  },
};

module.exports = nextConfig;
