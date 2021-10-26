module.exports = {
  images: { domains: ['res.cloudinary.com', 'via.placeholder.com'] },
  env: {
    STRIPE_KEY: process.env.STRIPE_CLIENT_ID,
    RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
  },
}
