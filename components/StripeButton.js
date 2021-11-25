import { Button, CircularProgress, ListItem, Box } from '@mui/material'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getError } from '../utils/error'
import classes from '../utils/classes'

const StripeButton = ({ userInfo, order }) => {
  const [loading, setLoading] = useState(false)

  const { enqueueSnackbar } = useSnackbar()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    try {
      const { data } = await axios.put(
        `/api/order/${order._id}/create-stripe-order`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )

      setLoading(false)
      window.location = data.url
    } catch (err) {
      setLoading(false)

      enqueueSnackbar(getError(err), { variant: 'error' })
    }
  }

  return (
    <ListItem>
      <Box sx={classes.fullWidth}>
        <form onSubmit={handleSubmit}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
            sx={classes.buttonMargin}
          >
            Pay with Stripe
            {loading && (
              <CircularProgress size={25} sx={classes.buttonProgress} />
            )}
          </Button>
        </form>
      </Box>
    </ListItem>
  )
}

export default StripeButton
