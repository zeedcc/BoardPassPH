#!/usr/bin/env node
/**
 * Migration script to remove 'coins' field from all profiles in Firestore.
 * Requires GOOGLE_APPLICATION_CREDENTIALS to be set to a service account JSON
 */
import admin from 'firebase-admin';

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credPath) {
  console.error('GOOGLE_APPLICATION_CREDENTIALS is not set. Aborting migration.');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function run() {
  console.log('Starting migration: removing coins from profiles collection...');
  const snap = await db.collection('profiles').get();
  console.log(`Found ${snap.size} profiles`);
  let count = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (Object.prototype.hasOwnProperty.call(data, 'coins')) {
      await doc.ref.update({ coins: admin.firestore.FieldValue.delete() });
      count++;
      console.log(`Removed coins from ${doc.id}`);
    }
  }
  console.log(`Migration completed. Removed coins from ${count} profiles.`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(2); });
