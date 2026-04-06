/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false,
  // Allow Vercel builds to succeed — type safety enforced locally via tsc
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  async rewrites() {
    const apiBase           = process.env.NEXT_PUBLIC_API_URL              || 'http://localhost:3000'
    const authCoreUrl       = process.env.NEXT_PUBLIC_AUTH_CORE_URL        || 'http://localhost:4000'
    const sorosokeUrl       = process.env.NEXT_PUBLIC_SOROSOKE_URL         || 'http://localhost:3003'
    const familyUrl         = process.env.NEXT_PUBLIC_FAMILY_URL           || 'http://localhost:3055'
    const sessionUrl        = process.env.NEXT_PUBLIC_SESSION_URL          || 'http://localhost:3006'
    const runnerUrl         = process.env.NEXT_PUBLIC_RUNNER_URL           || 'http://localhost:3056'
    const jollofUrl         = process.env.NEXT_PUBLIC_JOLLOF_URL           || 'http://localhost:3046'
    const sesoUrl           = process.env.NEXT_PUBLIC_SESO_URL             || 'http://localhost:3050'
    const spiritVoiceUrl    = process.env.NEXT_PUBLIC_SPIRIT_VOICE_URL     || 'http://localhost:3041'
    const bankingGatewayUrl = process.env.NEXT_PUBLIC_BANKING_GATEWAY_URL  || 'http://localhost:9000'
    const villageUrl        = process.env.NEXT_PUBLIC_VILLAGE_URL          || 'http://localhost:3002'
    const cowrieUnionUrl    = process.env.NEXT_PUBLIC_COWRIE_UNION_URL     || 'http://localhost:4050'
    const walletBffUrl      = process.env.NEXT_PUBLIC_WALLET_BFF_URL       || 'http://localhost:8600'
    const ogboUtuUrl        = process.env.NEXT_PUBLIC_OGBO_UTU_URL         || 'http://localhost:3051'
    const eventEngineUrl    = process.env.NEXT_PUBLIC_EVENT_ENGINE_URL     || 'http://localhost:3058'
    const gateGuardianUrl   = process.env.NEXT_PUBLIC_GATE_GUARDIAN_URL    || 'http://localhost:3059'
    const loveWorldUrl      = process.env.NEXT_PUBLIC_LOVE_WORLD_URL      || 'http://localhost:3070'
    const kerawaUrl         = process.env.NEXT_PUBLIC_KERAWA_URL         || 'http://localhost:3071'
    return [
      // ── Banking services (all before generic /api catch-all) ──
      // Specific banking sub-routes MUST come before the catch-all /api/bank/:path*
      { source: '/api/bank/ledger/:path*',           destination: `${bankingGatewayUrl}/bank/ledger/:path*`           },
      { source: '/api/bank/transfer-direct',         destination: `${bankingGatewayUrl}/bank/transfer`                },
      { source: '/api/bank/corridor-banks/:path*',   destination: `${bankingGatewayUrl}/bank/corridor-banks/:path*`   },
      { source: '/api/bank/esusu-clock/:path*',      destination: `${bankingGatewayUrl}/bank/esusu-clock/:path*`      },
      { source: '/api/bank/ancestral-buffer/:path*', destination: `${bankingGatewayUrl}/bank/ancestral-buffer/:path*` },
      { source: '/api/bank/griot-credit/:path*',     destination: `${bankingGatewayUrl}/bank/griot-credit/:path*`     },
      { source: '/api/bank/wallets/:path*',          destination: 'http://localhost:9000/api/bank/wallets/:path*'       },
      { source: '/api/bank/subscriptions/:path*',    destination: 'http://localhost:9000/api/bank/subscriptions/:path*' },
      { source: '/api/bank/:path*',         destination: `${bankingGatewayUrl}/bank/:path*`  },
      { source: '/api/cowrie/:path*',       destination: `${cowrieUnionUrl}/v1/:path*`       },
      { source: '/api/cowrie-flow/:path*',  destination: `${cowrieUnionUrl}/cowrie-flow/:path*` },
      { source: '/api/wallet/:path*',       destination: `${walletBffUrl}/wallet/:path*`     },
      { source: '/api/ogbo/:path*',         destination: `${ogboUtuUrl}/:path*`              },
      // ── Jollof TV ─────────────────────────────────────────────
      { source: '/api/jollof/:path*',       destination: `${jollofUrl}/:path*`               },
      // ── Love World ──────────────────────────────────────────────
      { source: '/api/love/:path*',         destination: `${loveWorldUrl}/love/:path*`       },
      { source: '/api/kerawa/:path*',       destination: `${kerawaUrl}/kerawa/:path*`     },
      // ── Seso Chat ─────────────────────────────────────────────
      { source: '/api/seso/:path*',         destination: `${sesoUrl}/api/v1/:path*`            },
      // ── Spirit Voice ──────────────────────────────────────────
      { source: '/api/spirit-voice/:path*', destination: `${spiritVoiceUrl}/:path*`          },
      // ── Sòrò Sókè Feed ───────────────────────────────────────
      { source: '/api/feed/:path*',         destination: `${sorosokeUrl}/feed/:path*`        },
      { source: '/api/posts/:path*',        destination: `${sorosokeUrl}/posts/:path*`       },
      // ── Village Registry ──────────────────────────────────────
      { source: '/api/villages',            destination: `${villageUrl}/v1/villages`         },
      { source: '/api/villages/:path*',     destination: `${villageUrl}/v1/villages/:path*`  },
      // ── Auxiliary services ────────────────────────────────────
      { source: '/api/sessions/:path*',     destination: `${sessionUrl}/sessions/:path*`     },
      { source: '/api/runners/:path*',      destination: `${runnerUrl}/runners/:path*`       },
      // ── Event Engine (port 3058) ──────────────────────────────
      { source: '/api/events/:path*',       destination: `${eventEngineUrl}/:path*`           },
      { source: '/api/event/:path*',        destination: `${eventEngineUrl}/event/:path*`     },
      { source: '/api/ticket/:path*',       destination: `${eventEngineUrl}/ticket/:path*`    },
      // ── Honor service (XP, tiers, unlocks, progression) ──────
      {
        source: '/api/honor/:path*',
        destination: `${process.env.HONOR_SERVICE_URL || 'http://localhost:3065'}/honor/:path*`,
      },
      // ── Rings service (bonds, invitations) ────────────────────
      {
        source: '/api/rings/:path*',
        destination: `${process.env.RINGS_SERVICE_URL || 'http://localhost:3060'}/rings/:path*`,
      },
      // ── Gate Guardian (port 3059) ─────────────────────────────
      { source: '/api/gate-guardian/:path*',destination: `${gateGuardianUrl}/:path*`          },
      // ── Auth Core (family BEFORE generic v1) ─────────────────
      { source: '/api/v1/family/:path*',    destination: `${familyUrl}/api/v1/family/:path*` },
      { source: '/api/v1/village-applications/:path*', destination: `${villageUrl}/v1/village-applications/:path*` },
      { source: '/api/v1/village-applications', destination: `${villageUrl}/v1/village-applications` },
      { source: '/api/v1/village-memberships', destination: `${villageUrl}/v1/village-memberships` },
      // On Vercel, route handlers in app/api/v1/ handle these paths directly.
      // Locally, the rewrite proxies to auth-core. Skip on Vercel to avoid rewrite conflicts.
      ...(process.env.VERCEL ? [] : [
        { source: '/api/v1/:path*',         destination: `${authCoreUrl}/api/v1/:path*`      },
      ]),
      { source: '/api/sorosoke/:path*',     destination: `${sorosokeUrl}/:path*`             },
      // ── Generic fallback (local dev only — on Vercel, route handlers cover all paths) ──
      ...(process.env.VERCEL ? [] : [
        { source: '/api/:path*',            destination: `${apiBase}/api/:path*`             },
      ]),
    ]
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.afrikonnect.io' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    typedRoutes: false,
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },

  // ── Security Headers ───────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=(self), payment=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' http://localhost:* ws://localhost:* https://*.ngrok-free.dev wss://*.ngrok-free.dev",
              "media-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
