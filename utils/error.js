import db from './db'

const getError = (err) =>
  err.response && err.response.data ? err.response.data : err.message

const onError = async (err, req, res, next) => {
  await db.disconnect()

  res.status(500).send(err.toString())
}
export { getError, onError }
