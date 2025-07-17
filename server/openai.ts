import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

interface FinancialContext {
  dashboardData: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlySavings: number;
    expensesByCategory: Array<{ category: string; amount: number; color: string }>;
    monthlyTrends: Array<{ month: string; income: number; expenses: number }>;
  };
  transactions: Array<{
    type: string;
    amount: string;
    description: string;
    category?: { name: string };
    date: string;
  }>;
  budgets: Array<{
    budgetedAmount: string;
    period: string;
    category?: { name: string };
  }>;
}

export async function generateFinancialAdvice(
  userMessage: string,
  context: FinancialContext
): Promise<string> {
  try {
    const systemPrompt = `Você é um assistente financeiro especializado em finanças pessoais e empresariais, falando apenas em português brasileiro. Você ajuda usuários a entender suas finanças, otimizar gastos, criar orçamentos e tomar decisões financeiras inteligentes.

Contexto financeiro atual do usuário:
- Saldo total: R$ ${context.dashboardData.totalBalance.toFixed(2)}
- Receita mensal: R$ ${context.dashboardData.monthlyIncome.toFixed(2)}
- Despesas mensais: R$ ${context.dashboardData.monthlyExpenses.toFixed(2)}
- Economia mensal: R$ ${context.dashboardData.monthlySavings.toFixed(2)}

Gastos por categoria:
${context.dashboardData.expensesByCategory.map(cat => `- ${cat.category}: R$ ${cat.amount.toFixed(2)}`).join('\n')}

Tendências mensais:
${context.dashboardData.monthlyTrends.map(trend => `- ${trend.month}: Receitas R$ ${trend.income.toFixed(2)}, Despesas R$ ${trend.expenses.toFixed(2)}`).join('\n')}

Orçamentos ativos:
${context.budgets.map(budget => `- ${budget.category?.name || 'Categoria não definida'}: R$ ${budget.budgetedAmount} (${budget.period})`).join('\n')}

Últimas transações:
${context.transactions.slice(0, 5).map(t => `- ${t.type === 'receita' ? '+' : '-'}R$ ${t.amount} - ${t.description} (${t.category?.name || 'Sem categoria'})`).join('\n')}

Diretrizes:
1. Responda sempre em português brasileiro
2. Use dados específicos do usuário para dar conselhos personalizados
3. Seja prático e objetivo
4. Ofereça sugestões concretas e acionáveis
5. Mantenha um tom amigável e profissional
6. Quando apropriado, identifique padrões nos dados financeiros
7. Sugira otimizações específicas baseadas nos dados reais
8. Forneça insights sobre tendências e comportamentos financeiros`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Desculpe, não foi possível gerar uma resposta no momento.";
  } catch (error) {
    console.error("Error generating financial advice:", error);
    return "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente em alguns instantes.";
  }
}

export async function generateFinancialInsights(
  financialData: FinancialContext
): Promise<{
  spendingAnalysis: string;
  budgetRecommendations: string;
  savingsOpportunities: string;
}> {
  try {
    const prompt = `Analise os dados financeiros do usuário e forneça insights estruturados em formato JSON com as seguintes chaves:
- spendingAnalysis: Análise detalhada dos padrões de gastos
- budgetRecommendations: Recomendações específicas para orçamentos
- savingsOpportunities: Oportunidades concretas de economia

Dados financeiros:
${JSON.stringify(financialData, null, 2)}

Responda APENAS com JSON válido em português brasileiro.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.3,
    });

    const insights = JSON.parse(response.choices[0].message.content || "{}");
    return {
      spendingAnalysis: insights.spendingAnalysis || "Análise não disponível",
      budgetRecommendations: insights.budgetRecommendations || "Recomendações não disponíveis",
      savingsOpportunities: insights.savingsOpportunities || "Oportunidades não identificadas",
    };
  } catch (error) {
    console.error("Error generating financial insights:", error);
    return {
      spendingAnalysis: "Erro ao gerar análise de gastos",
      budgetRecommendations: "Erro ao gerar recomendações de orçamento",
      savingsOpportunities: "Erro ao identificar oportunidades de economia",
    };
  }
}
