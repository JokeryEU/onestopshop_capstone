import { AppBar, Container, Toolbar, Typography } from '@material-ui/core'
import Head from 'next/head'
import useStyles from '../utils/styles'

const Layout = ({ children }) => {
  const classes = useStyles()

  return (
    <>
      <Head>
        <title>Welcome to OneStopShop</title>
      </Head>
      <AppBar position="static" classname={classes.navbar}>
        <Toolbar>
          <Typography>OneStopShop</Typography>
        </Toolbar>
      </AppBar>
      <Container classname={classes.main}>{children}</Container>
      <footer classname={classes.footer}>
        <Typography>All rights reserved. OneStopShop.</Typography>
      </footer>
    </>
  )
}

export default Layout
