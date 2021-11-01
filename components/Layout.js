import { useContext, useState, useEffect } from 'react'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Link,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Toolbar,
  Tooltip,
  Typography,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from '@mui/material'
import { createTheme } from '@mui/material/styles'
import MenuIcon from '@mui/icons-material/Menu'
import CancelIcon from '@mui/icons-material/Cancel'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SearchIcon from '@mui/icons-material/Search'
import { getError } from '../utils/error'
import Head from 'next/head'
import classes from '../utils/classes'
import NextLink from 'next/link'
import { Store } from '../utils/store'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import axios from 'axios'

const Layout = ({ description, title, children }) => {
  const router = useRouter()
  const { state, dispatch } = useContext(Store)
  const { darkMode, cart, userInfo, wish } = state

  const [query, setQuery] = useState('')
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [categories, setCategories] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)

  const theme = createTheme({
    components: {
      MuiLink: {
        defaultProps: {
          underline: 'hover',
        },
      },
    },
    typography: {
      h1: {
        fontSize: '1.6rem',
        fontWeight: 400,
        margin: '1rem 0',
      },
      h2: {
        fontSize: '1.4rem',
        fontWeight: 400,
        margin: '1rem 0',
      },
    },
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#f0c000',
      },
      secondary: {
        main: '#208080',
      },
    },
  })

  const sidebarOpenHandler = () => {
    setSidebarVisible(true)
  }
  const sidebarCloseHandler = () => {
    setSidebarVisible(false)
  }

  const { enqueueSnackbar } = useSnackbar()

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`/api/products/categories`)
      setCategories(data)
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' })
    }
  }

  const queryChangeHandler = (e) => {
    setQuery(e.target.value)
  }
  const submitHandler = (e) => {
    e.preventDefault()
    router.push(`/search?query=${query}`)
  }

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const calculateCartQty = cart.cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  )

  const darkModeChangeHandler = () => {
    dispatch({ type: darkMode ? 'DARK_MODE_OFF' : 'DARK_MODE_ON' })
    const newDarkMode = !darkMode
    Cookies.set('darkMode', newDarkMode ? 'ON' : 'OFF', {
      sameSite: 'lax',
    })
  }

  const loginClickHandler = (e) => setAnchorEl(e.currentTarget)

  const loginMenuCloseHandler = (e, redirect) => {
    setAnchorEl(null)
    if (redirect) {
      router.push(redirect)
    }
  }

  const menuCloseHandler = () => setAnchorEl(null)

  const logoutClickHandler = () => {
    setAnchorEl(null)
    dispatch({ type: 'USER_LOGOUT' })
    Cookies.remove('userInfo')
    Cookies.remove('cartItems')
    Cookies.remove('shippingAddress')
    Cookies.remove('paymentMethod')
    Cookies.remove('wishItems')
    router.push('/')
  }

  const isDesktop = useMediaQuery('(min-width:600px)')

  return (
    <>
      <Head>
        <title>
          {title ? `${title} · OneStopShop` : 'Welcome to OneStopShop'}
        </title>
        {description && <meta name="description" content={description}></meta>}
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" sx={classes.appbar}>
          <Toolbar sx={classes.toolbar}>
            <Box display="flex" alignItems="center">
              <IconButton
                edge="start"
                aria-label="open drawer"
                onClick={sidebarOpenHandler}
                sx={classes.menuButton}
              >
                <MenuIcon sx={classes.navbarButton} />
              </IconButton>
              <NextLink href="/" passHref>
                <Link>
                  <Typography
                    style={isDesktop ? classes.brand : classes.brandSm}
                  >
                    OneStopShop
                  </Typography>
                </Link>
              </NextLink>
            </Box>
            <Drawer open={sidebarVisible} onClose={sidebarCloseHandler}>
              <List>
                <ListItem>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography>Shopping by category</Typography>
                    <IconButton
                      aria-label="close"
                      onClick={sidebarCloseHandler}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider light />
                {categories.map((category) => (
                  <NextLink
                    key={category}
                    href={`/search?category=${category}`}
                    passHref
                  >
                    <ListItem
                      button
                      component="a"
                      onClick={sidebarCloseHandler}
                    >
                      <ListItemText primary={category}></ListItemText>
                    </ListItem>
                  </NextLink>
                ))}
              </List>
            </Drawer>
            <Box sx={isDesktop ? classes.visible : classes.hidden}>
              <form onSubmit={submitHandler}>
                <Box sx={classes.searchForm}>
                  <InputBase
                    name="query"
                    sx={classes.searchInput}
                    placeholder="Search products"
                    onChange={queryChangeHandler}
                  />
                  <IconButton
                    type="submit"
                    sx={classes.searchButton}
                    aria-label="search"
                  >
                    <SearchIcon />
                  </IconButton>
                </Box>
              </form>
            </Box>
            <Box>
              <Switch
                checked={darkMode}
                onChange={darkModeChangeHandler}
                checkedIcon={
                  <Image src="/moon.svg" alt="moon" width="24" height="22" />
                }
                icon={
                  <Image src="/sunny.svg" alt="sun" width="24" height="24" />
                }
                edge="end"
              />
              <NextLink href="/cart" passHref>
                <Tooltip title="Shopping Cart" arrow>
                  <IconButton
                    aria-label="show cart items"
                    color="inherit"
                    edge="end"
                    size="small"
                  >
                    {cart.cartItems.length > 0 ? (
                      <Badge color="secondary" badgeContent={calculateCartQty}>
                        <ShoppingCartRoundedIcon />
                      </Badge>
                    ) : (
                      <ShoppingCartOutlinedIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </NextLink>
              <NextLink href="/wishlist" passHref>
                <Tooltip title="Wishlist" arrow>
                  <IconButton
                    aria-label="show wishlist items"
                    color="inherit"
                    size="small"
                  >
                    {wish && wish.wishItems.length > 0 ? (
                      <Badge
                        badgeContent={wish.wishItems.length}
                        color="secondary"
                      >
                        <FavoriteIcon color="error" />
                      </Badge>
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </NextLink>
              {userInfo ? (
                <>
                  <Tooltip title="Account" arrow size="small">
                    <IconButton
                      aria-label="account options"
                      aria-controls="simple-menu"
                      aria-haspopup="true"
                      onClick={loginClickHandler}
                    >
                      <Avatar
                        alt={userInfo.firstname + ' ' + userInfo.lastName}
                        src={userInfo?.profilePic}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={menuCloseHandler}
                  >
                    <MenuItem
                      onClick={(e) => loginMenuCloseHandler(e, '/profile')}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={(e) =>
                        loginMenuCloseHandler(e, '/order-history')
                      }
                    >
                      Order History
                    </MenuItem>
                    <Divider />
                    {userInfo.role === 'Admin' && (
                      <MenuItem
                        onClick={(e) =>
                          loginMenuCloseHandler(e, '/admin/dashboard')
                        }
                      >
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <NextLink href="/login" passHref>
                  <Tooltip title="Login" arrow>
                    <IconButton aria-label="login" color="inherit" size="small">
                      <AccountCircleIcon />
                    </IconButton>
                  </Tooltip>
                </NextLink>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        <Container component="main" maxWidth="xl" sx={classes.main}>
          {children}
        </Container>
        <Box component="footer" sx={classes.footer}>
          <Typography>
            All rights reserved. Copyright &copy; OneStopShop
          </Typography>
        </Box>
      </ThemeProvider>
    </>
  )
}

export default Layout
