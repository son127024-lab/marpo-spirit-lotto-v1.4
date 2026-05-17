import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

const options = {};

declare global {
  // eslint-disable-next-line no-var
  var _marpoMongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._marpoMongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._marpoMongoClientPromise = client.connect();
  }

  clientPromise = global._marpoMongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getMarpoDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("marpo_group");
}