import {
  Button,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core'
import Layout from '../components/layout'
import useStyles from '../utils/styles'
import NextLink from 'next/link'
import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { Store } from '../utils/store'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

const RegisterPage = () => {
  const router = useRouter()
  const { redirect } = router.query
  const { state, dispatch } = useContext(Store)
  const { userInfo } = state
  useEffect(() => {
    if (userInfo) {
      router.push('/')
    }
  }, [userInfo])

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const classes = useStyles()

  const submitHandler = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return alert("Passwords don't match!")
    }
    try {
      const { data } = await axios.post('/api/users/register', {
        firstName,
        lastName,
        email,
        password,
      })

      dispatch({ type: 'USER_LOGIN', payload: data })
      Cookies.set('userInfo', data, { sameSite: 'lax' })
      router.push(redirect || '/')
    } catch (error) {
      alert(error)
    }
  }
  return (
    <Layout title="Register">
      <form onSubmit={submitHandler} className={classes.form}>
        <Typography component="h1" variant="h1">
          Register
        </Typography>
        <List>
          <ListItem>
            <TextField
              variant="outlined"
              fullWidth
              id="firstName"
              label="First Name"
              inputProps={{ type: 'text' }}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              id="lastName"
              label="Last Name"
              inputProps={{ type: 'text' }}
              onChange={(e) => setLastName(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              id="email"
              label="Email"
              inputProps={{ type: 'email' }}
              onChange={(e) => setEmail(e.target.value)}
            />
          </ListItem>
          <ListItem>
            <TextField
              variant="outlined"
              fullWidth
              id="password"
              label="Password"
              inputProps={{ type: 'password' }}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              inputProps={{ type: 'password' }}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </ListItem>
          <ListItem>
            <Button variant="contained" type="submit" fullWidth color="primary">
              Register
            </Button>
          </ListItem>
          <ListItem>
            Already have an account? &nbsp;
            <NextLink href={`/login?redirect=${redirect || '/'}`} passHref>
              <Link>Login</Link>
            </NextLink>
          </ListItem>
        </List>
      </form>
    </Layout>
  )
}

export default RegisterPage
