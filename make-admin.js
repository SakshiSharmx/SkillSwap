require("dotenv").config({ path: ".env.local" })
const { MongoClient } = require("mongodb")

const EMAIL = process.argv[2]
if (!EMAIL) {
  console.log("Usage: node make-admin.js your@email.com")
  process.exit(1)
}

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB ?? "skillswap")
    const result = await db.collection("users").updateOne(
      { email: EMAIL },
      { $set: { role: "admin" } }
    )
    if (result.matchedCount === 0) {
      console.log(`❌ No user found with email: ${EMAIL}`)
      console.log("   Log in to the app first, then run this again.")
    } else {
      console.log(`✅ ${EMAIL} is now an admin!`)
      console.log("   Restart your server and go to /admin")
    }
  } finally {
    await client.close()
  }
}

main().catch(console.error)