/**
 * Script para corrigir tipo de relacionamento via API
 */

async function fixRelationshipType() {
  try {
    // 1. Fazer login
    console.log('🔐 Fazendo login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'master@quantor.com',
        password: 'master123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Erro no login');
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido');

    // 2. Buscar todos os relacionamentos
    console.log('\n📋 Buscando relacionamentos...');
    const relationshipsResponse = await fetch('http://localhost:3000/api/relationships', {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      }
    });

    const relationships = await relationshipsResponse.json();
    console.log(`Encontrados ${relationships.length} relacionamentos`);

    // Mostrar relacionamentos
    console.log('\n📊 Relacionamentos atuais:');
    relationships.forEach(r => {
      console.log(`  ID: ${r.id} | Tipo: ${r.type} | Doc: ${r.document} | Nome: ${r.socialname || r.social_name}`);
    });

    // 3. Atualizar o ID 2 para fornecedor (último cadastrado)
    const idToUpdate = 2;
    console.log(`\n🔄 Atualizando relacionamento ID ${idToUpdate} para 'fornecedor'...`);
    
    const updateResponse = await fetch(`http://localhost:3000/api/relationships/${idToUpdate}/type`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      },
      body: JSON.stringify({ type: 'fornecedor' })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(`Erro ao atualizar: ${error.error}`);
    }

    const result = await updateResponse.json();
    console.log('✅', result.message);

    // 4. Verificar atualização
    console.log('\n✅ Verificando atualização...');
    const verifyResponse = await fetch('http://localhost:3000/api/relationships', {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      }
    });

    const updatedRelationships = await verifyResponse.json();
    const updated = updatedRelationships.find(r => r.id === idToUpdate);
    
    if (updated) {
      console.log(`✅ ID ${updated.id} agora é do tipo: ${updated.type}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

fixRelationshipType();
