import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, ArrowLeft } from 'lucide-react';

const Termos = () => {
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
            <FileText className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Termos de Serviço</h1>
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar a plataforma Kourtify, você concorda com estes Termos de Serviço.
                Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Kourtify é uma plataforma que conecta jogadores de esportes de raquete com quadras disponíveis,
                facilita a organização de partidas e torneios, e mantém rankings de jogadores.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Para utilizar determinadas funcionalidades, você precisará criar uma conta.
                Você é responsável por:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Manter a segurança de sua senha</li>
                <li>Todas as atividades realizadas em sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitável</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Você concorda em não:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Violar quaisquer leis ou regulamentos</li>
                <li>Usar a plataforma para fins fraudulentos</li>
                <li>Interferir no funcionamento adequado da plataforma</li>
                <li>Coletar dados de outros usuários sem autorização</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Reservas e Pagamentos</h2>
              <p className="text-muted-foreground leading-relaxed">
                As reservas de quadras estão sujeitas à disponibilidade e às políticas de cancelamento
                de cada estabelecimento parceiro. Os pagamentos são processados de forma segura através
                de nossos parceiros de pagamento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo da plataforma, incluindo textos, gráficos, logos e software,
                é propriedade da Kourtify e protegido por leis de propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Kourtify atua como intermediária entre jogadores e proprietários de quadras.
                Não nos responsabilizamos por disputas entre usuários, qualidade das instalações
                ou danos pessoais ocorridos durante as atividades esportivas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Modificações dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento.
                As alterações entrarão em vigor imediatamente após a publicação na plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para dúvidas sobre estes Termos de Serviço, entre em contato através do email{' '}
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

export default Termos;
