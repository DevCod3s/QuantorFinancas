
const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function fix() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado ao Neon DB via pg driver.");

    const sql = `
      CREATE TABLE IF NOT EXISTS "product_units" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "name" text NOT NULL,
        "abbreviation" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "products_services" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "sku" text,
        "type" text DEFAULT 'product' NOT NULL,
        "unit" text DEFAULT 'un' NOT NULL,
        "category_id" integer,
        "subcategory_id" integer,
        "sale_price" numeric(15, 2) DEFAULT '0' NOT NULL,
        "cost_price" numeric(15, 2) DEFAULT '0',
        "ncm" text,
        "status" text DEFAULT 'active' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_units_user_id_users_id_fk') THEN
          ALTER TABLE "product_units" ADD CONSTRAINT "product_units_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_services_user_id_users_id_fk') THEN
          ALTER TABLE "products_services" ADD CONSTRAINT "products_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
        END IF;
      END $$;
    `;

    await client.query(sql);
    console.log("SUCESSO: Tabelas de catálogo criadas!");
  } catch (err) {
    console.error("ERRO:", err);
  } finally {
    await client.end();
  }
}

fix();
