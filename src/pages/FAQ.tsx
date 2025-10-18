import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o início
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
            <p className="text-xl text-muted-foreground">
              Tire suas dúvidas sobre a Kourtify
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-8">
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">🎾 O que é a Kourtify?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  A Kourtify conecta jogadores e amantes de esportes de raquete, permitindo encontrar parceiros, 
                  reservar quadras e participar de torneios com ranking em tempo real.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">📍 Como funciona o sistema de busca por quadras?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Usamos geolocalização para mostrar as quadras mais próximas. Você pode filtrar por tipo de piso, 
                  cidade e disponibilidade, e reservar diretamente na plataforma.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">🧑‍🤝‍🧑 Como encontro um parceiro de jogo?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Crie seu perfil, escolha o esporte e o nível. A Kourtify mostra jogadores compatíveis próximos, 
                  e você pode enviar convites e registrar resultados.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">🏆 Como funciona o ranking de jogadores?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Partidas e torneios geram pontuação automática. O ranking é atualizado em tempo real e pode ser 
                  global, regional ou exclusivo de grupos.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">🎯 Posso criar torneios?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim! Organize torneios com poucos cliques. O sistema cria chaves automáticas e atualiza 
                  resultados online em tempo real.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">🏠 Sou proprietário de quadra. Como posso divulgar meu espaço?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Cadastre sua quadra e escolha um plano parceiro. Assim, ela aparece no marketplace, 
                  aumenta a visibilidade e melhora a gestão de horários.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">💳 Como são feitos os pagamentos?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Pagamentos são processados via parceiros seguros (Stripe, Mercado Pago, etc.), com criptografia 
                  e conformidade com a LGPD.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">⚙️ A Kourtify é gratuita?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  O uso básico é gratuito. Recursos premium podem ter custos adicionais, sempre informados 
                  antes da contratação.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">🔐 Meus dados estão seguros?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Sim. Seguimos a LGPD, usamos criptografia e você pode solicitar a exclusão de dados via{' '}
                  <a href="mailto:devskourtify@gmail.com" className="text-primary hover:underline">
                    devskourtify@gmail.com
                  </a>
                  .
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">💬 Como entro em contato com o suporte?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Entre em contato com nosso suporte pelo formulário da{' '}
                  <Link to="/contato" className="text-primary hover:underline">
                    página Suporte
                  </Link>
                  {' '}ou envie um e-mail para{' '}
                  <a href="mailto:devskourtify@gmail.com" className="text-primary hover:underline">
                    devskourtify@gmail.com
                  </a>
                  .
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Não encontrou o que procurava?
            </p>
            <Link to="/contato">
              <span className="text-primary hover:underline font-semibold">
                Fale com nosso suporte →
              </span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
