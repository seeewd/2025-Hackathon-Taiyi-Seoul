import * as couchbase from "couchbase";
import { getCredentials } from "./db.js";

let cluster = null;
let bucket = null;
let usersCollection = null;

// Couchbase 클러스터 연결 함수
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

        bucket = cluster.bucket("borrow"); // `user` 버킷 사용
        usersCollection = bucket.defaultCollection();
    }

    return cluster;
}

// 사용자 컬렉션 가져오기
export async function getUsersCollection() {
    if (!usersCollection) {
        await getCluster(); // 클러스터 연결
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

// ✅ 중복된 export 제거 후 올바르게 내보내기
export default {
    getCluster,
    getUsersCollection,
    queryCouchbase
};
