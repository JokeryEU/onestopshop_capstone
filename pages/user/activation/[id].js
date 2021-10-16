import {
  CircularProgress,
  Link,
  List,
  ListItem,
  Typography,
} from '@material-ui/core'
import Layout from '../../../components/Layout'
import useStyles from '../../..//utils/styles'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { getError } from '../../../utils/error'
import NextLink from 'next/link'
import { useEffect, useState } from 'react'

const AccountActivationPage = ({ params }) => {
  const id = params.id
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const activateAcc = async () => {
      setLoading(true)
      try {
        await axios.post('/api/users/activateAccount', { id })
        setLoading(false)
        setSuccess(true)
      } catch (error) {
        setLoading(false)
        enqueueSnackbar(getError(error), { variant: 'error' })
      }
    }
    activateAcc()
  }, [])

  return (
    <Layout title="Account Activation">
      <List className={classes.form}>
        <Typography component="h1" variant="h1">
          Account Activation
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : success ? (
          <ListItem>
            <Typography variant="h2" align="justify">
              Your account has been activated. You can now{' '}
              <NextLink href="/login" passHref>
                <Link>LOGIN</Link>
              </NextLink>
            </Typography>
          </ListItem>
        ) : (
          <ListItem>
            <Typography variant="h2" align="justify">
              Your activation link has{' '}
              <span style={{ color: 'red' }}>expired</span>, please register
              again.
            </Typography>
          </ListItem>
        )}
      </List>
    </Layout>
  )
}

export function getServerSideProps({ req, params }) {
  if (!req.headers.cookie) {
    return {
      props: { params },
    }
  }
  const user = req.headers.cookie.includes('accessToken')

  if (!user) {
    return {
      props: { params },
    }
  } else {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
}

export default AccountActivationPage
