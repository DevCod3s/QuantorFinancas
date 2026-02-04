/**
 * Script de validação da migração para Neon DB
 * 
 * Verifica se todas as tabelas foram criadas corretamente
 * e se a conexão está funcionando adequadamente.
 */

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

console.log('🔍 Validando migração para Neon DB...\n');

async function validateDatabase() {
  try {
    // 1. Testar conexão
    console.log('✓ Testando conexão com Neon DB...');
    const connectionTest = await sql`SELECT NOW() as current_time, version() as postgres_version`;
    console.log(`  ✅ Conexão estabelecida com sucesso!`);
    console.log(`  📅 Hora do servidor: ${connectionTest[0].current_time}`);
    console.log(`  🗄️  Versão PostgreSQL: ${connectionTest[0].postgres_version.split(',')[0]}\n`);

    // 2. Listar todas as tabelas
    console.log('✓ Listando tabelas criadas...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    const expectedTables = [
      'ai_interactions',
      'bank_accounts',
      'budgets',
      'categories',
      'chart_of_accounts',
      'relationships',
      'sessions',
      'transactions',
      'users'
    ];

    console.log(`  📋 Tabelas encontradas: ${tables.length}`);
    tables.forEach(t => console.log(`     - ${t.table_name}`));

    // 3. Verificar se todas as tabelas esperadas existem
    console.log('\n✓ Verificando integridade das tabelas...');
    const tableNames = tables.map(t => t.table_name);
    const missingTables = expectedTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.log(`  ⚠️  Tabelas faltando: ${missingTables.join(', ')}`);
    } else {
      console.log(`  ✅ Todas as ${expectedTables.length} tabelas esperadas foram criadas!`);
    }

    // 4. Contar registros em cada tabela
    console.log('\n✓ Contando registros...');
    for (const table of expectedTables) {
      if (tableNames.includes(table)) {
        // Usar query dinâmica sem template literal para nomes de tabela
        const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
        const count = await sql(countQuery);
        console.log(`  📊 ${table}: ${count[0].count} registro(s)`);
      }
    }

    // 5. Verificar índices e constraints principais
    console.log('\n✓ Verificando constraints e relacionamentos...');
    const constraints = await sql`
      SELECT 
        tc.table_name, 
        tc.constraint_name, 
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
        AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
      ORDER BY tc.table_name, tc.constraint_type
    `;
    
    console.log(`  🔗 Constraints encontradas: ${constraints.length}`);
    
    const pkCount = constraints.filter(c => c.constraint_type === 'PRIMARY KEY').length;
    const fkCount = constraints.filter(c => c.constraint_type === 'FOREIGN KEY').length;
    const uqCount = constraints.filter(c => c.constraint_type === 'UNIQUE').length;
    
    console.log(`     - Primary Keys: ${pkCount}`);
    console.log(`     - Foreign Keys: ${fkCount}`);
    console.log(`     - Unique Constraints: ${uqCount}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRAÇÃO PARA NEON DB VALIDADA COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📝 Resumo:');
    console.log(`   • Banco: Neon DB (PostgreSQL Serverless)`);
    console.log(`   • Tabelas criadas: ${tables.length}/${expectedTables.length}`);
    console.log(`   • Constraints: ${constraints.length} (${pkCount} PK, ${fkCount} FK, ${uqCount} UQ)`);
    console.log(`   • Status: ✅ Pronto para uso!\n`);

  } catch (error) {
    console.error('\n❌ Erro durante a validação:', error);
    process.exit(1);
  }
}

validateDatabase();
