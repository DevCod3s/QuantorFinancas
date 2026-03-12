import { db } from "../server/db";
import { chartAccounts } from "../shared/schema";

async function listAccounts() {
    try {
        const accounts = await db.select().from(chartAccounts);
        console.log("ACCOUNTS_DATA:" + JSON.stringify(accounts));
    } catch (error) {
        console.error("DB_ERROR:" + error.message);
    }
}

listAccounts().catch(console.error);
