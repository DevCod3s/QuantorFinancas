/**
 * Script para corrigir datas T00:00:00.000Z (meia-noite UTC) para T12:00:00 local 
 * (= T15:00:00.000Z UTC em BRT).
 * 
 * Bug: Transações de recorrência foram salvas com T00:00:00.000Z,
 * que em BRT (UTC-3) exibe dia anterior (ex: 15/04 vira 14/04 21:00).
 * 
 * Correção: Adiciona 12 horas à data UTC, mantendo o mesmo dia calendário.
 */
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function fixDates() {
  // 1. Buscar todas as transações com T00:00:00 UTC
  const affected = await sql`
    SELECT id, date 
    FROM transactions 
    WHERE EXTRACT(HOUR FROM date) = 0 
      AND EXTRACT(MINUTE FROM date) = 0 
      AND EXTRACT(SECOND FROM date) = 0
    ORDER BY id
  `;

  console.log(`\n📊 Transações com T00:00:00 UTC (bug timezone): ${affected.length}`);
  
  if (affected.length === 0) {
    console.log('✅ Nenhuma transação para corrigir!');
    return;
  }

  // Mostrar primeiras 5 como exemplo
  console.log('\nExemplos (antes):');
  affected.slice(0, 5).forEach(t => {
    console.log(`  ID=${t.id} | ${t.date}`);
  });

  // 2. Corrigir: adicionar 12 horas (T00:00 UTC → T12:00 UTC)
  // Isso garante que em qualquer fuso até UTC-12 o dia se mantém correto
  const result = await sql`
    UPDATE transactions 
    SET date = date + INTERVAL '12 hours'
    WHERE EXTRACT(HOUR FROM date) = 0 
      AND EXTRACT(MINUTE FROM date) = 0 
      AND EXTRACT(SECOND FROM date) = 0
    RETURNING id, date
  `;

  console.log(`\n✅ ${result.length} transações corrigidas!`);
  
  // Mostrar primeiras 5 como exemplo do resultado
  console.log('\nExemplos (depois):');
  result.slice(0, 5).forEach(t => {
    console.log(`  ID=${t.id} | ${t.date}`);
  });

  // 3. Verificação: não deve ter mais T00:00:00
  const remaining = await sql`
    SELECT COUNT(*) as count 
    FROM transactions 
    WHERE EXTRACT(HOUR FROM date) = 0 
      AND EXTRACT(MINUTE FROM date) = 0 
      AND EXTRACT(SECOND FROM date) = 0
  `;
  
  console.log(`\n🔍 Verificação: ${remaining[0].count} transações restantes com T00:00:00 UTC`);
  console.log(remaining[0].count === '0' || remaining[0].count === 0 
    ? '✅ Todas as datas corrigidas com sucesso!' 
    : '⚠️ Ainda há datas para corrigir!');
}

fixDates().catch(console.error);
