import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, ArrowLeft } from 'lucide-react';

const Privacidade = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o início
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Informações que Coletamos</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Coletamos diferentes tipos de informações para fornecer e melhorar nosso serviço:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Dados pessoais:</strong> nome, e-mail, telefone, localização</li>
                <li><strong>Dados de perfil:</strong> nível de jogo, esportes praticados, preferências</li>
                <li><strong>Dados de uso:</strong> histórico de reservas, partidas, torneios</li>
                <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Como Usamos suas Informações</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Utilizamos seus dados para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Fornecer e manter nossos serviços</li>
                <li>Processar reservas e pagamentos</li>
                <li>Conectar você com outros jogadores</li>
                <li>Enviar notificações importantes sobre seu uso da plataforma</li>
                <li>Melhorar e personalizar sua experiência</li>
                <li>Prevenir fraudes e garantir a segurança</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Podemos compartilhar suas informações apenas nas seguintes situações:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Com proprietários de quadras quando você faz uma reserva</li>
                <li>Com outros jogadores quando você aceita uma partida ou torneio</li>
                <li>Com processadores de pagamento para transações</li>
                <li>Quando exigido por lei ou ordem judicial</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Segurança dos Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações
                contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia,
                firewalls e acesso restrito aos dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Seus Direitos</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem direito a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Revogar consentimentos previamente dados</li>
                <li>Solicitar a portabilidade de seus dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies e Tecnologias Similares</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência,
                analisar o uso da plataforma e personalizar conteúdo. Você pode gerenciar
                suas preferências de cookies nas configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir os
                propósitos descritos nesta política, salvo quando a lei exigir um período
                de retenção mais longo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Menores de Idade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nossos serviços não são destinados a menores de 18 anos. Se tomarmos conhecimento
                de que coletamos dados de menores sem autorização dos responsáveis, tomaremos
                medidas para remover essas informações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos
                você sobre alterações significativas publicando a nova política na plataforma
                e atualizando a data no topo desta página.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta Política de Privacidade,
                entre em contato através do email{' '}
                <a href="mailto:devskourtify@gmail.com" className="text-primary hover:underline">
                  devskourtify@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacidade;
