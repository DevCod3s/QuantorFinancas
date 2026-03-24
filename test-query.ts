import { db } from "./server/db";
import { transactions } from "./server/db/schema";
import { ilike, or } from "drizzle-orm";

async function run() {
  try {
    const list = await db.select().from(transactions).where(ilike(transactions.description, '%Adiantamento%'));
    console.log(JSON.stringify(list, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

run();
