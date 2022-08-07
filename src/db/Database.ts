import { MongoClient } from "mongodb";
import Config from "../Config";
import Logger from "../Logger";
const c = new Logger("Database");

export default class Database {
    private static instance: Database;
    public static client: MongoClient;
    private constructor() {
        Database.client = new MongoClient(Config.MONGO_URI);
        try {
            Database.client.connect();
        } catch (e) {
            c.error(e as Error);
        }
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async get(collection: string, query?: object) {
        try {
            const db = await Database.client.db();
            const _collection = db.collection(collection);
            if (!(await db.listCollections({ name: collection }).toArray()).length) {
                c.warn(`Collection ${collection} does not exist. Creating...`);
                await _collection.createIndexes([{ key: { id: 1 }, unique: true }]);
            }
            const result = query ? await _collection.findOne(query) : await _collection.findOne();
            return result;
        } catch (e) {
            c.error(e as Error);
            return null;
        }
    }

    public async set(collection: string, payload: any) {
        try {
            const db = await Database.client.db();
            const _collection = db.collection(collection);
            if (!(await db.listCollections({ name: collection }).toArray()).length) {
                c.warn(`Collection ${collection} does not exist. Creating...`);
                await _collection.createIndexes([{ key: { id: 1 }, unique: true }]);
            }
            return await _collection.insertOne(payload);
        } catch (e) {
            c.error(e as Error);
        }
    }

    public async update(collection: string, query: object, payload: any) {
        try {
            const db = await Database.client.db();
            const _collection = db.collection(collection);
            if (!(await db.listCollections({ name: collection }).toArray()).length) {
                c.warn(`Collection ${collection} does not exist. Creating...`);
                await _collection.createIndexes([{ key: { id: 1 }, unique: true }]);
            }
            return await _collection.updateOne(query, { $set: payload }, { upsert: true });
        } catch (e) {
            c.error(e as Error);
        }
    }

    public async delete(collection: string, query: object) {
        try {
            const db = await Database.client.db();
            const _collection = db.collection(collection);
            if (!(await db.listCollections({ name: collection }).toArray()).length) {
                c.warn(`Collection ${collection} does not exist. Creating...`);
                await _collection.createIndexes([{ key: { id: 1 }, unique: true }]);
            }
            return await _collection.deleteOne(query);
        } catch (e) {
            c.error(e as Error);
        }
    }
}