# 🚀 Configurações de Integração - Kourtify

Este documento contém as instruções para configurar as integrações necessárias do seu projeto Kourtify.

## ✅ Stripe (Configurado)

O Stripe já foi configurado com:
- **Produto 1**: Reserva de Quadra - R$ 50,00/hora (ID: `prod_T7i2mKZIDDNq5O`)
- **Produto 2**: Inscrição em Torneio - R$ 100,00 (ID: `prod_T7i3JXAmW5RgEe`)
- **Edge Functions**: 4 funções criadas para processar pagamentos

### Próximos Passos no Stripe:
1. Acesse seu [Dashboard do Stripe](https://dashboard.stripe.com)
2. Complete as informações da sua empresa em "Settings" > "Business settings"
3. Configure métodos de pagamento aceitos (cartão, PIX, etc.)
4. Ative o modo produção quando estiver pronto

## 🔐 Google Authentication

### 1. Configurar Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth Client ID"
5. Configure:
   - **Application type**: Web application
   - **Name**: Kourtify Auth
   - **Authorized JavaScript origins**: 
     - `https://seu-dominio.com`
     - `https://kourtify.lovable.app` (URL temporária)
   - **Authorized redirect URIs**:
     - `https://otiqpklbednbytyvaoah.supabase.co/auth/v1/callback`

### 2. Configurar no Supabase

1. Acesse seu [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para "Authentication" > "Providers"
3. Ative o "Google" provider
4. Cole o **Client ID** e **Client Secret** do Google
5. Configure as URLs:
   - **Site URL**: `https://seu-dominio.com`
   - **Redirect URLs**: `https://seu-dominio.com/**`

### 3. Testar Integração

Após configurado, os usuários poderão:
- Fazer login com Google
- Registrar-se automaticamente
- Acessar dashboards específicos por role

## 🌐 Domínio Personalizado

### 1. No Lovable

1. Vá para "Project Settings" > "Domains"
2. Clique em "Connect Domain"
3. Digite seu domínio (ex: `kourtify.com`)
4. Anote os registros DNS fornecidos

### 2. No seu Registrador de Domínio

Configure os seguintes registros DNS:

```
Tipo: A
Nome: @
Valor: 185.158.133.1

Tipo: A  
Nome: www
Valor: 185.158.133.1
```

### 3. Aguardar Propagação

- Pode levar até 24-48 horas
- SSL será configurado automaticamente
- Teste com [DNS Checker](https://dnschecker.org)

## 📊 Analytics e Monitoramento

### Supabase Analytics
- Acesse logs em tempo real no dashboard
- Monitore performance das edge functions
- Acompanhe uso do banco de dados

### Stripe Dashboard
- Monitore transações
- Configure webhooks (se necessário)
- Analise métricas de pagamento

## 🔧 Funcionalidades Implementadas

### Pagamentos
- ✅ Reserva de quadras via Stripe
- ✅ Inscrições em torneios via Stripe  
- ✅ Confirmação automática após pagamento
- ✅ Páginas de sucesso personalizadas

### Autenticação
- ✅ Login/registro com email
- ✅ Roles diferenciados (player/partner)
- ✅ Dashboards específicos por role
- 🔄 Google Auth (pendente configuração)

### Database
- ✅ Tabelas para courts, bookings, tournaments
- ✅ RLS policies configuradas
- ✅ Triggers e funções auxiliares

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs no Supabase Dashboard
2. Teste com dados de exemplo do Stripe
3. Use as ferramentas de debug do navegador

---

**Status Atual**: 80% completo
**Próximo passo**: Configurar Google Auth e domínio personalizado