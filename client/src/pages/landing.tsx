import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center">
                <i className="fas fa-chart-line text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Quantor</h1>
                <p className="text-muted-foreground">Gestão Financeira Inteligente</p>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Controle suas finanças com{' '}
              <span className="text-primary">Inteligência Artificial</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Uma ferramenta completa para gerenciar receitas, despesas e orçamentos, 
              com um assistente IA especializado em finanças para te ajudar a tomar 
              decisões mais inteligentes.
            </p>
            
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
              onClick={() => window.location.href = '/api/login'}
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Começar Agora
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="card-hover border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-chart-pie text-secondary text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Dashboard Intuitivo</h3>
                <p className="text-muted-foreground">
                  Visualize seus dados financeiros com gráficos e estatísticas 
                  em tempo real para uma gestão mais eficiente.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-wallet text-accent text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Orçamentos Inteligentes</h3>
                <p className="text-muted-foreground">
                  Crie orçamentos mensais e anuais com categorias personalizáveis 
                  e acompanhe seu progresso automaticamente.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-border">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-robot text-primary text-xl"></i>
                </div>
                <h3 className="text-xl font-semibold mb-2">Assistente IA</h3>
                <p className="text-muted-foreground">
                  Converse com nossa IA especializada em finanças para obter 
                  conselhos personalizados e insights valiosos.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para transformar sua gestão financeira?
            </h3>
            <p className="text-muted-foreground mb-6">
              Junte-se a milhares de usuários que já estão no controle de suas finanças
            </p>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => window.location.href = '/api/login'}
            >
              Entrar na Plataforma
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
