
import * as dotenv from "dotenv";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from "drizzle-orm";

dotenv.config();

async function fixTables() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERRO: DATABASE_URL não encontrada no .env");
    process.exit(1);
  }

  console.log("Conectando ao banco de dados...");
  const client = neon(url);
  const db = drizzle(client);

  try {
    console.log("Iniciando criação de tabelas faltantes...");
    
    // Tabela product_units
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "product_units" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" integer NOT NULL,
        "name" text NOT NULL,
        "abbreviation" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✓ Tabela product_units ok");

    // Tabela products_services
    await db.execute(sql`
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
    `);
    console.log("✓ Tabela products_services ok");

    // Adicionar constraints de chave estrangeira
    console.log("Adicionando constraints...");
    await db.execute(sql`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_units_user_id_users_id_fk') THEN
          ALTER TABLE "product_units" ADD CONSTRAINT "product_units_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_services_user_id_users_id_fk') THEN
          ALTER TABLE "products_services" ADD CONSTRAINT "products_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");
        END IF;
      END $$;
    `);
    console.log("✓ Constraints ok");

    console.log("SUCESSO: Tabelas criadas no Neon DB!");
    process.exit(0);
  } catch (err) {
    console.error("ERRO ao executar SQL:", err);
    process.exit(1);
  }
}

fixTables();
