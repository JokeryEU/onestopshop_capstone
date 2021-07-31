import mongoose from 'mongoose'

const connection = {}

async function connect() {
  if (connection.isConnected) {
    return
  }
  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState
    if (connection.isConnected === 1) {
      console.log('use previous connection')
      return
    }
    await mongoose.disconnect()
  }
  const db = await mongoose.connect(process.env.MONGODB_ADDRESS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  connection.isConnected = db.connections[0].readyState
}

async function disconnect() {
  if (connection.isConnected) {
    if (process.env.MONGODB_ADDRESS === 'production') {
      await mongoose.disconnect()
      connection.isConnected = false
    } else {
      console.log('Not disconnect')
    }
  }
}

const db = { connect, disconnect }

export default db
