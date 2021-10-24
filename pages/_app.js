import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { SnackbarProvider } from 'notistack'
import { useEffect } from 'react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { StoreProvider } from '../utils/store'
import ReactGA from 'react-ga'

const MyApp = ({ Component, pageProps }) => {
  ReactGA.initialize('G-M3S3DQQC6D')

  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side')
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
    ReactGA.pageview(window.location.pathname + window.location.search)
  }, [])
  return (
    <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <StoreProvider>
        <GoogleReCaptchaProvider reCaptchaKey={process.env.RECAPTCHA_SITE_KEY}>
          <PayPalScriptProvider deferLoading={true}>
            <Component {...pageProps} />
          </PayPalScriptProvider>
        </GoogleReCaptchaProvider>
      </StoreProvider>
    </SnackbarProvider>
  )
}

export default MyApp
