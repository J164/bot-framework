import { type Collection, type CreateCollectionOptions, type IndexDescription, type Document, type Db, type CollectionOptions, MongoClient } from 'mongodb';

export type CollectionFetcher = typeof fetchCollection;

type UnpromotedCollectionOptions = { readonly promoteLongs: false; readonly promoteValues: false; readonly promoteBuffers: false };

export type MongoCollectionOptions = {
	readonly baseOptions: CollectionOptions & UnpromotedCollectionOptions;
	readonly createOptions: CreateCollectionOptions & UnpromotedCollectionOptions & { validator: Document };
	readonly indexOptions: IndexDescription[];
};

let client: MongoClient | undefined;
let database: Db | undefined;
let collectionNames: string[] | undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const collections: Record<string, Collection<any>> = {};

export async function fetchCollection<T extends Document>(name: string, url: string, options: MongoCollectionOptions): Promise<Collection<T>> {
	if (!database || !collectionNames) {
		client ??= new MongoClient(url);
		await client.connect();
		database ??= client.db();
		collectionNames = await database
			.listCollections()
			.map((info) => {
				return info.name;
			})
			.toArray();
	}

	const { baseOptions, createOptions, indexOptions } = options;

	return (collections[name] ??= collectionNames.includes(name)
		? database.collection<T>(name, baseOptions)
		: await createCollection<T>(name, database, createOptions, indexOptions));
}

async function createCollection<T extends Document>(
	name: string,
	database: Db,
	createOptions: CreateCollectionOptions,
	indexOptions: IndexDescription[],
): Promise<Collection<T>> {
	const collection = await database.createCollection<T>(name, createOptions);

	if (indexOptions.length > 0) {
		await collection.createIndexes(indexOptions);
	}

	return collection;
}
