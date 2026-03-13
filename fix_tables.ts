
import * as dotenv from "dotenv";
dotenv.config();

import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function fixTables() {
  console.log("Iniciando criação de tabelas faltantes...");
  try {
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

    // Adicionar constraints se necessário (opcional para correção rápida)
    // Mas vamos adicionar para manter a integridade
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

    console.log("Tabelas criadas com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao fixar tabelas:", err);
    process.exit(1);
  }
}

fixTables();
