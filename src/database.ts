import { type Collection, type CreateCollectionOptions, type IndexDescription, type Document, type Db, type CollectionOptions } from 'mongodb';

export type CollectionFetcher = typeof fetchCollection;

type UnpromotedCollectionOptions = { promoteLongs: false; promoteValues: false; promoteBuffers: false };

type MongoCollectionOptions = {
	baseOptions: CollectionOptions & UnpromotedCollectionOptions;
	createOptions: CreateCollectionOptions & UnpromotedCollectionOptions & { validator: Document };
	indexOptions: IndexDescription[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const collections: Record<string, Collection<any>> = {};
let collectionNames: string[] | undefined;

export async function fetchCollection<T extends Document>(name: string, database: Db, options: MongoCollectionOptions): Promise<Collection<T>> {
	if (!collectionNames) {
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
