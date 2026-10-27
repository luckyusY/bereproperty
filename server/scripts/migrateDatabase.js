import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const sourceUri = process.env.SOURCE_MONGODB_URI;
const targetUri = process.env.MONGODB_URI;
const markerName = '__bereproperty_migration';
const chunkSize = 500;

if (!sourceUri || !targetUri) {
  console.error('Set SOURCE_MONGODB_URI to the current database and MONGODB_URI to the new BereProperty database.');
  process.exit(1);
}

let source;
let target;
try {
  source = await mongoose.createConnection(sourceUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  target = await mongoose.createConnection(targetUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  const sourceDb = source.db;
  const targetDb = target.db;
  if (targetDb.databaseName !== 'bereproperty') throw new Error(`Target database must be named bereproperty; got ${targetDb.databaseName}.`);
  if (sourceDb.databaseName === targetDb.databaseName && source.host === target.host) throw new Error('Source and target point to the same database.');

  const marker = targetDb.collection(markerName);
  const priorRun = await marker.findOne({ _id: 'source' });
  const targetCollections = await targetDb.listCollections({}, { nameOnly: true }).toArray();
  const appTargetCollections = targetCollections.filter(item => !item.name.startsWith('system.') && item.name !== markerName);
  if (!priorRun && appTargetCollections.length) throw new Error('The BereProperty target database is not empty. No data was changed.');
  if (priorRun && priorRun.database !== sourceDb.databaseName) throw new Error('An interrupted migration marker belongs to a different source database.');
  if (!priorRun) await marker.insertOne({ _id: 'source', database: sourceDb.databaseName, startedAt: new Date() });

  const collections = (await sourceDb.listCollections({}, { nameOnly: false }).toArray()).filter(item => !item.name.startsWith('system.'));
  const report = [];
  for (const info of collections) {
    const from = sourceDb.collection(info.name);
    const to = targetDb.collection(info.name);
    let copied = 0;
    let operations = [];
    for await (const document of from.find({})) {
      operations.push({ replaceOne: { filter: { _id: document._id }, replacement: document, upsert: true } });
      if (operations.length >= chunkSize) {
        await to.bulkWrite(operations, { ordered: false }); copied += operations.length; operations = [];
      }
    }
    if (operations.length) { await to.bulkWrite(operations, { ordered: false }); copied += operations.length; }

    const indexes = (await from.indexes()).filter(index => index.name !== '_id_').map(({ key, name, unique, sparse, expireAfterSeconds, partialFilterExpression, collation, weights, default_language, language_override, textIndexVersion, wildcardProjection }) => ({
      key, name, ...(unique !== undefined && { unique }), ...(sparse !== undefined && { sparse }), ...(expireAfterSeconds !== undefined && { expireAfterSeconds }),
      ...(partialFilterExpression && { partialFilterExpression }), ...(collation && { collation }), ...(weights && { weights }),
      ...(default_language && { default_language }), ...(language_override && { language_override }), ...(textIndexVersion && { textIndexVersion }), ...(wildcardProjection && { wildcardProjection }),
    }));
    if (indexes.length) await to.createIndexes(indexes);
    const sourceCount = await from.countDocuments();
    const targetCount = await to.countDocuments();
    if (sourceCount !== targetCount) throw new Error(`Verification failed for ${info.name}: source ${sourceCount}, target ${targetCount}. Rerun is safe for this marked migration.`);
    report.push({ collection: info.name, count: sourceCount, copied });
  }

  console.log(`Verified ${report.length} collections from ${sourceDb.databaseName} into bereproperty:`);
  for (const item of report) console.log(`${item.collection}: ${item.count}`);
  await marker.drop();
  console.log('Migration complete. The source database was left unchanged. Switch the API to MONGODB_URI and retain the source URI for rollback until cutover is verified.');
} catch (error) {
  console.error(error.message || 'Database migration failed. Source data was not deleted.');
  process.exitCode = 1;
} finally {
  await Promise.all([source?.close(), target?.close()].filter(Boolean));
}
