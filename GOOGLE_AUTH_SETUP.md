# 🔐 Configuração Google Auth - Passo a Passo

## ✅ Funcionalidade Implementada

O botão "Continuar com Google" já foi adicionado ao sistema de login/registro. Agora você precisa configurar o Google OAuth:

## 📋 Passo 1: Google Cloud Console

### 1.1 Acesse o Console
- Vá para [Google Cloud Console](https://console.cloud.google.com/)
- Faça login com sua conta Google

### 1.2 Criar/Selecionar Projeto
- Clique em "Select a project" no topo
- Clique em "NEW PROJECT" ou selecione um existente
- Nome sugerido: "Kourtify Auth"

### 1.3 Ativar Google+ API
- No menu lateral, vá em "APIs & Services" > "Enabled APIs & services"
- Clique em "+ ENABLE APIS AND SERVICES"
- Procure por "Google+ API" e ative

### 1.4 Configurar Tela de Consentimento
- Vá em "APIs & Services" > "OAuth consent screen"
- Escolha "External" (para permitir qualquer usuário Google)
- Preencha os campos obrigatórios:
  - **App name**: Kourtify
  - **User support email**: seu-email@gmail.com
  - **Developer contact email**: seu-email@gmail.com
- Em "Authorized domains", adicione:
  - `lovable.app`
  - `supabase.co`
- Clique em "SAVE AND CONTINUE"

### 1.5 Criar Credenciais OAuth
- Vá em "APIs & Services" > "Credentials"
- Clique em "+ CREATE CREDENTIALS" > "OAuth client ID"
- Escolha "Web application"
- Configure:
  - **Name**: Kourtify Web Client
  - **Authorized JavaScript origins**:
    ```
    https://kourtify.com
    https://kourtify.lovable.app
    https://963a9c24-3cfc-4cee-a0a3-0d25482b6a7a.lovableproject.com
    https://otiqpklbednbytyvaoah.supabase.co
    ```
  - **Authorized redirect URIs**:
    ```
    https://otiqpklbednbytyvaoah.supabase.co/auth/v1/callback
    ```

⚠️ **IMPORTANTE**: Adicione TODAS as URLs acima para que o login funcione tanto no preview quanto no domínio final.

### 1.6 Copiar Credenciais
- Após criar, copie:
  - **Client ID** (ex: 123456789-abc123.apps.googleusercontent.com)
  - **Client Secret** (ex: GOCSPX-abc123xyz789)

## 📋 Passo 2: Configuração no Supabase

### 2.1 Acessar Dashboard
- Vá para [Supabase Dashboard](https://supabase.com/dashboard/project/otiqpklbednbytyvaoah)
- Faça login na sua conta

### 2.2 Configurar Provider Google
- No menu lateral, vá em "Authentication" > "Providers"
- Encontre "Google" na lista
- Clique para expandir
- **Ative** o toggle "Enable sign in with Google"

### 2.3 Inserir Credenciais
- **Client ID**: Cole o Client ID do Google Console
- **Client Secret**: Cole o Client Secret do Google Console
- **Skip nonce verification**: Mantenha desabilitado
- Clique em "Save"

### 2.4 Configurar URLs de Redirecionamento
- Vá em "Authentication" > "URL Configuration"
- **Site URL**: `https://kourtify.com`
- **Redirect URLs**: 
  ```
  https://kourtify.com/**
  https://kourtify.lovable.app/**
  https://963a9c24-3cfc-4cee-a0a3-0d25482b6a7a.lovableproject.com/**
  https://localhost:3000/**
  ```

## 📋 Passo 3: Teste da Configuração

### 3.1 Teste Local
1. Acesse sua aplicação
2. Clique em "Entrar" no header
3. Clique em "Continuar com Google"
4. Deve abrir popup do Google para autorização

### 3.2 Problemas Comuns

**Erro: "redirect_uri_mismatch"**
- Verifique se as URLs de redirect estão corretas no Google Console
- Confirme se a URL do Supabase está exata

**Erro: "invalid_client"**
- Verifique se Client ID e Secret estão corretos no Supabase
- Confirme se a API Google+ está habilitada

**Erro: "requested path is invalid"**
- Verifique as configurações de URL no Supabase Dashboard
- Confirme se Site URL está correto

## 📋 Passo 4: URLs Importantes para Configuração

### URLs para Google Console:
- **Authorized JavaScript origins**:
  - `https://kourtify.com` (Domínio principal)
  - `https://kourtify.lovable.app` (Domínio Lovable)
  - `https://963a9c24-3cfc-4cee-a0a3-0d25482b6a7a.lovableproject.com` (Preview)
  - `https://otiqpklbednbytyvaoah.supabase.co` (Supabase)

- **Authorized redirect URIs**:
  - `https://otiqpklbednbytyvaoah.supabase.co/auth/v1/callback`

### URLs para Supabase:
- **Site URL**: `https://kourtify.com`
- **Redirect URLs**: 
  - `https://kourtify.com/**`
  - `https://kourtify.lovable.app/**`
  - `https://963a9c24-3cfc-4cee-a0a3-0d25482b6a7a.lovableproject.com/**`

## 🎯 Resultado Final

Após configurar tudo:
- ✅ Usuários podem fazer login com Google
- ✅ Perfil é criado automaticamente na primeira autenticação
- ✅ Sistema funciona tanto para players quanto partners
- ✅ Redirect automático após login bem-sucedido

## 🔧 Configurações Opcionais

### Personalizar Domínio (Após configurar domínio personalizado)
Quando você configurar seu domínio personalizado, atualize:

**No Google Console:**
- Authorized JavaScript origins: `https://seudominio.com`
- Authorized redirect URIs: `https://otiqpklbednbytyvaoah.supabase.co/auth/v1/callback`

**No Supabase:**
- Site URL: `https://seudominio.com`
- Redirect URLs: `https://seudominio.com/**`

---

💡 **Dica**: Teste sempre no ambiente de desenvolvimento antes de usar em produção!