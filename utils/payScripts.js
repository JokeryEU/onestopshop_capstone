import axios from 'axios'

export const loadPaypalScript = async (userInfo, paypalDispatch) => {
  const { data: clientId } = await axios.get('/api/keys/paypal', {
    headers: { authorization: `Bearer ${userInfo.accessToken}` },
  })
  paypalDispatch({
    type: 'resetOptions',
    value: {
      'client-id': clientId,
      currency: 'EUR',
    },
  })
  paypalDispatch({ type: 'setLoadingStatus', value: 'pending' })
}
