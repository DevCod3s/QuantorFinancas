/**
 * Script para corrigir o tipo de relacionamento no banco de dados
 * Atualiza Eraldo Martins Nunes para 'outros'
 */

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function fixRelationshipType() {
  try {
    console.log('✅ Conectado ao Neon DB\n');

    // Atualizar Eraldo Martins Nunes para 'outros'
    const result = await sql`
      UPDATE relationships 
      SET type = 'outros' 
      WHERE social_name ILIKE '%Eraldo Martins Nunes%'
      RETURNING id, document, social_name, type
    `;

    if (result.length > 0) {
      console.log('✅ Relacionamento atualizado com sucesso!\n');
      console.log('Dados atualizados:');
      console.log(`  ID: ${result[0].id}`);
      console.log(`  Documento: ${result[0].document}`);
      console.log(`  Nome: ${result[0].social_name}`);
      console.log(`  Novo tipo: ${result[0].type}`);
    } else {
      console.log('⚠️ Nenhum registro encontrado com o nome "Eraldo Martins Nunes"');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

fixRelationshipType();
