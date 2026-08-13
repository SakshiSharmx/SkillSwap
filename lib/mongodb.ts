import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local")
}

// Strip any tls params from URI — we set them in code instead
const uri = process.env.MONGODB_URI
  .replace(/&?tls=true/g, "")
  .replace(/&?tlsAllowInvalidCertificates=true/g, "")
  .replace(/&?tlsAllowInvalidHostnames=true/g, "")

const options = {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  maxPoolSize: 1,
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options).connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  clientPromise = new MongoClient(uri, options).connect()
}

export default clientPromise

export async function getDb(dbName = process.env.MONGODB_DB ?? "skillswap") {
  const client = await clientPromise
  return client.db(dbName)
}