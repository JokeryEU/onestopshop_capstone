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
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=G-M3S3DQQC6D`}
      />
      <Script strategy="lazyOnload">
        {`
     window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', 'G-M3S3DQQC6D');
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
