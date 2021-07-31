import { AppBar, Container, Toolbar, Typography } from '@material-ui/core'
import Head from 'next/head'

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Welcome to OneStopShop</title>
      </Head>
      <AppBar position="static">
        <Toolbar>
          <Typography>OneStopShop</Typography>
        </Toolbar>
      </AppBar>
      <Container>{children}</Container>
      <footer>
        <Typography>All rights reserved. OneStopShop.</Typography>
      </footer>
    </>
  )
}

export default Layout
