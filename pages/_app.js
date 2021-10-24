import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { SnackbarProvider } from 'notistack'
import { useEffect } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { StoreProvider } from '../utils/store'
import Script from 'next/script'

const MyApp = ({ Component, pageProps }) => {
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      <Script strategy="afterInteractive">
        {`
     window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
    `}
      </Script>

      <SnackbarProvider
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <StoreProvider>
          <GoogleReCaptchaProvider
            reCaptchaKey={process.env.RECAPTCHA_SITE_KEY}
          >
            <PayPalScriptProvider deferLoading={true}>
              <Component {...pageProps} />
            </PayPalScriptProvider>
          </GoogleReCaptchaProvider>
        </StoreProvider>
      </SnackbarProvider>
    </>
  )
}

export default MyApp
