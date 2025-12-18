import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useAiInteractions, useSendMessage } from "@/hooks/use-ai-chat";
import { AiInteraction } from "@/types";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatInterface() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: interactions, isLoading } = useAiInteractions();
  const sendMessage = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  useEffect(() => {
    if (interactions && interactions.length > 0) {
      // Convert interactions to chat messages
      const chatMessages: ChatMessage[] = [];
      interactions.forEach((interaction: AiInteraction) => {
        chatMessages.push({
          id: `${interaction.id}-user`,
          content: interaction.message,
          sender: 'user',
          timestamp: new Date(interaction.createdAt),
        });
        chatMessages.push({
          id: `${interaction.id}-ai`,
          content: interaction.response,
          sender: 'ai',
          timestamp: new Date(interaction.createdAt),
        });
      });
      setLocalMessages(chatMessages);
    }
  }, [interactions]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setLocalMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');

    try {
      const response = await sendMessage.mutateAsync(currentMessage);
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: response.message,
        sender: 'ai',
        timestamp: new Date(),
      };

      setLocalMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setLocalMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickActions = [
    {
      title: 'Análise de Gastos',
      description: 'Relatório detalhado',
      icon: 'fas fa-chart-line',
      color: 'bg-secondary/10 text-secondary',
      message: 'Faça uma análise detalhada dos meus gastos deste mês e me dê sugestões de como posso economizar.',
    },
    {
      title: 'Dicas de Economia',
      description: 'Sugestões personalizadas',
      icon: 'fas fa-lightbulb',
      color: 'bg-accent/10 text-accent',
      message: 'Baseado no meu perfil financeiro, que dicas de economia você pode me dar?',
    },
    {
      title: 'Metas Financeiras',
      description: 'Planejamento futuro',
      icon: 'fas fa-target',
      color: 'bg-blue-50 text-blue-600',
      message: 'Me ajude a definir metas financeiras realistas para os próximos meses.',
    },
  ];

  const handleQuickAction = (actionMessage: string) => {
    setMessage(actionMessage);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-80 mx-auto" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-96 space-y-4 p-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-12 w-64 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-robot text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Assistente Financeiro IA</h2>
        <p className="text-muted-foreground mt-1">Seu consultor financeiro pessoal com inteligência artificial</p>
      </div>

      {/* Chat Interface */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
              <i className="fas fa-robot text-white"></i>
            </div>
            <div>
              <CardTitle>Assistente Quantor</CardTitle>
              <p className="text-sm text-secondary">Online - Pronto para ajudar</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {localMessages.length === 0 ? (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <div className="bg-muted rounded-lg p-3 max-w-xs lg:max-w-md">
                  <p className="text-foreground text-sm">
                    Olá! Sou seu assistente financeiro. Posso ajudá-lo a analisar seus gastos, 
                    sugerir otimizações no orçamento e responder dúvidas sobre finanças. 
                    Como posso ajudá-lo hoje?
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Agora</p>
                </div>
              </div>
            ) : (
              localMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.sender === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg p-3 max-w-xs lg:max-w-md ${
                      msg.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'user'
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>

                  {msg.sender === 'user' && (
                    <img
                      src={(user as any)?.profileImageUrl || (user as any)?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                      alt="Usuário"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                </div>
              ))
            )}
            
            {sendMessage.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <div className="bg-muted rounded-lg p-3 max-w-xs lg:max-w-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <div className="flex-1">
                <FloatingInput
                  label="Digite sua pergunta..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessage.isPending}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessage.isPending}
                className="bg-primary hover:bg-primary/90 h-12 px-4"
              >
                <i className="fas fa-paper-plane"></i>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto p-4 text-left justify-start hover:shadow-md transition-shadow"
            onClick={() => handleQuickAction(action.message)}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                <i className={action.icon}></i>
              </div>
              <div>
                <p className="font-medium text-foreground">{action.title}</p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
