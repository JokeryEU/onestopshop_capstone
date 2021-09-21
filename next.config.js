module.exports = {
  reactStrictMode: true,
  images: { domains: ['res.cloudinary.com', 'via.placeholder.com'] },
  env: {
    STRIPE_KEY: process.env.STRIPE_CLIENT_ID,
  },
}
