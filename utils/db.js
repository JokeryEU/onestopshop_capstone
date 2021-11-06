import mongoose from 'mongoose'

// const connection = {}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connect() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    cached.promise = mongoose.connect(process.env.MONGODB_ADDRESS, opts)
  }
  cached.conn = await cached.promise
  return cached.conn
}

// async function connect() {
//   if (connection.isConnected) {
//     return
//   }
//   if (mongoose.connections.length > 0) {
//     connection.isConnected = mongoose.connections[0].readyState
//     if (connection.isConnected === 1) {
//       return
//     }
//     await mongoose.disconnect()
//   }
//   try {
//     const db = await mongoose.connect(process.env.MONGODB_ADDRESS, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     connection.isConnected = db.connections[0].readyState
//   } catch (error) {
//     console.log(error)
//   }
// }

async function disconnect() {
  // if (connection.isConnected) {
  //   if (process.env.NODE_ENV === 'production') {
  //     await mongoose.disconnect()
  //     connection.isConnected = false
  //   }
  // }
}

function convertDocToObj(doc) {
  doc._id = doc._id.toString()
  doc.createdAt = doc.createdAt.toString()
  doc.updatedAt = doc.updatedAt.toString()
  doc.user = doc.user.toString()
  if (doc.transactions) {
    doc.transactions = doc.transactions.map(convertDocToObj)
  }
  return doc
}

const db = { connect, disconnect, convertDocToObj }

export default db
