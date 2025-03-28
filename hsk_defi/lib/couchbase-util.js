import couchbase from "couchbase";
import { getCredentials } from "./db.js";

let cluster = null;
let bucket = null;
let usersCollection = null;

export async function getCluster() {
    const { username, password } = getCredentials();

    if (!cluster) {
        cluster = await couchbase.connect("couchbase://127.0.0.1", {
            username,
            password,
            timeoutOptions: {
                kvTimeout: 2000000,
                queryTimeout: 3000000,
                connectTimeout: 2000000,
            },
        });
        console.log("Connected to Couchbase cluster");

        bucket = cluster.bucket("borrow"); 
        usersCollection = bucket.defaultCollection();
    }

    return cluster;
}

export async function getUsersCollection() {
    if (!usersCollection) {
        await getCluster(); 
        if (!usersCollection) {
            throw new Error("Users collection not initialized");
        }
    }
    return usersCollection;
}

export async function queryCouchbase(statement, parameters = {}) {
    try {
        const cluster = await getCluster();
        const result = await cluster.query(statement, { parameters });
        return result.rows;
    } catch (error) {
        console.error("Error executing Couchbase query:", error);
        throw error;
    }
}

export default {
    getCluster,
    getUsersCollection,
    queryCouchbase
};
