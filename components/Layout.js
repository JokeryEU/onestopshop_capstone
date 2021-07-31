import { AppBar, Container, Link, Toolbar, Typography } from '@material-ui/core'
import Head from 'next/head'
import useStyles from '../utils/styles'
import NextLink from 'next/link'

const Layout = ({ description, title, children }) => {
  const classes = useStyles()

  return (
    <>
      <Head>
        <title>
          {title ? `${title} - OneStopShop` : 'Welcome to OneStopShop'}
        </title>
        {description && <meta name="description" content={description}></meta>}
      </Head>
      <AppBar position="static" className={classes.navbar}>
        <Toolbar>
          <NextLink href="/" passHref>
            <Link>
              <Typography className={classes.brand}>OneStopShop</Typography>
            </Link>
          </NextLink>
          <div className={classes.grow}></div>
          <div>
            <NextLink href="/cart" passHref>
              <Link>Cart</Link>
            </NextLink>
            <NextLink href="/login" passHref>
              <Link>Login</Link>
            </NextLink>
          </div>
        </Toolbar>
      </AppBar>
      <Container className={classes.main}>{children}</Container>
      <footer className={classes.footer}>
        <Typography>All rights reserved. OneStopShop.</Typography>
      </footer>
    </>
  )
}

export default Layout
