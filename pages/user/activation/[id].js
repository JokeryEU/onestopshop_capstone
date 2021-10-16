import { Link, List, ListItem, Typography } from '@material-ui/core'
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

  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const activateAcc = async () => {
      try {
        await axios.post('/api/users/activateAccount', { id })
        setSuccess(true)
      } catch (error) {
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
        {success ? (
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
