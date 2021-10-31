import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { SnackbarProvider } from 'notistack'
import { CacheProvider } from '@emotion/react'
import createEmotionCache from '../utils/createEmotionCache'
import { StoreProvider } from '../utils/store'
import Script from 'next/script'

const clientSideEmotionCache = createEmotionCache()

const MyApp = ({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}) => {
  return (
    <>
      <Script
        id="firstAnalyticScript"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      <Script id="secondAnalyticScript" strategy="afterInteractive">
        {`
     window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
  
    gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
      page_path: window.location.pathname,
    });
    `}
      </Script>
      <CacheProvider value={emotionCache}>
        <SnackbarProvider
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <StoreProvider>
            <PayPalScriptProvider deferLoading={true}>
              <Component {...pageProps} />
            </PayPalScriptProvider>
          </StoreProvider>
        </SnackbarProvider>
      </CacheProvider>
    </>
  )
}

export default MyApp
