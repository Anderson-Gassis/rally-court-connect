import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Contato = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validações básicas
    if (!formData.name || !formData.email || !formData.category || !formData.message) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // Simular envio de email (aqui você implementaria a integração real com Resend ou outro serviço)
    try {
      // TODO: Integrar com edge function para enviar email
      console.log('Enviando mensagem:', formData);
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Mensagem Enviada!",
        description: "Recebemos sua solicitação e responderemos em breve.",
      });

      // Limpar formulário
      setFormData({
        name: '',
        email: '',
        category: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "Erro ao Enviar",
        description: "Tente novamente ou envie um email para devskourtify@gmail.com",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o início
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Suporte</h1>
            <p className="text-xl text-muted-foreground">
              Estamos aqui para ajudar você
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
            <p className="text-lg leading-relaxed mb-6">
              Nosso time de suporte está pronto para ajudar jogadores, organizadores e parceiros da Kourtify.
            </p>
            
            <p className="text-lg leading-relaxed mb-6">
              Se precisar de assistência técnica, dúvidas sobre torneios, ranking, reservas ou funcionalidades, entre em contato preenchendo o formulário abaixo.
            </p>

            <div className="bg-muted/50 p-4 rounded-lg mb-8">
              <p className="text-sm">
                <strong>E-mail de suporte:</strong>{' '}
                <a href="mailto:devskourtify@gmail.com" className="text-primary hover:underline">
                  devskourtify@gmail.com
                </a>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jogador">Jogador</SelectItem>
                    <SelectItem value="proprietario">Proprietário de Quadra</SelectItem>
                    <SelectItem value="clube">Clube / Federação</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Mensagem / Descrição do Problema *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Descreva sua dúvida ou problema..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contato;
