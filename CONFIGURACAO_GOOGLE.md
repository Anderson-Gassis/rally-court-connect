# 🔧 Configuração Google - Passo a Passo Completo

## 📋 Parte 1: Google Auth (Autenticação)

### 1.1 Google Cloud Console - Criar Projeto
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar projeto" → "Novo Projeto"
3. Nome: "Kourtify"
4. Clique em "Criar"

### 1.2 Ativar APIs Necessárias
1. No menu lateral: **APIs e Serviços** → **Biblioteca**
2. Procure e ative:
   - ✅ **Google+ API** (para autenticação)
   - ✅ **Maps JavaScript API** (para mapas)
   - ✅ **Places API** (para buscar quadras)
   - ✅ **Geocoding API** (para endereços)

### 1.3 Configurar Tela de Consentimento OAuth
1. **APIs e Serviços** → **Tela de consentimento OAuth**
2. Escolha **Externo** (para permitir qualquer usuário Google)
3. Preencha:
   - **Nome do app**: Kourtify
   - **Email de suporte**: seu-email@gmail.com
   - **Email do desenvolvedor**: seu-email@gmail.com
4. **Domínios autorizados**:
   ```
   lovable.app
   supabase.co
   ```
5. **Salvar e continuar**

### 1.4 Criar Credenciais OAuth (Autenticação)
1. **APIs e Serviços** → **Credenciais**
2. **+ Criar credenciais** → **ID do cliente OAuth**
3. Tipo: **Aplicação da Web**
4. Nome: **Kourtify Web Client**
5. **Origens JavaScript autorizadas**:
   ```
   https://kourtify.lovable.app
   https://otiqpklbednbytyvaoah.supabase.co
   ```
6. **URIs de redirecionamento autorizados**:
   ```
   https://otiqpklbednbytyvaoah.supabase.co/auth/v1/callback
   ```
7. **Criar** → Copie **Client ID** e **Client Secret**

### 1.5 Criar Chave API (para Mapas)
1. **APIs e Serviços** → **Credenciais**
2. **+ Criar credenciais** → **Chave de API**
3. Nome: **Kourtify Maps Key**
4. **Restringir chave**:
   - Restrições de aplicativo: **Referenciadores HTTP**
   - Referenciadores de site:
   ```
   https://kourtify.lovable.app/*
   https://*.lovable.app/*
   ```
   - Restrições de API: Selecione apenas as APIs de Maps ativadas
5. **Salvar** → Copie a **Chave de API**

## 📋 Parte 2: Configuração no Supabase

### 2.1 Configurar Google Auth
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard/project/otiqpklbednbytyvaoah/auth/providers)
2. **Authentication** → **Providers** → **Google**
3. Ative **Enable sign in with Google**
4. Cole:
   - **Client ID**: (do passo 1.4)
   - **Client Secret**: (do passo 1.4)
5. **Save**

### 2.2 Configurar URLs de Redirecionamento
1. **Authentication** → **URL Configuration**
2. **Site URL**: `https://kourtify.lovable.app`
3. **Redirect URLs**: `https://kourtify.lovable.app/**`
4. **Save**

### 2.3 Adicionar Chave do Google Maps
1. No Lovable, vá em **Secrets** (use o botão de adicionar secret)
2. Adicione: `GOOGLE_MAPS_API_KEY`
3. Cole a chave de API do passo 1.5

## 📋 Parte 3: Teste das Configurações

### 3.1 Testar Google Auth
1. Acesse sua aplicação
2. Clique **Entrar** → **Continuar com Google**
3. Deve abrir popup do Google para autorização

### 3.2 Testar Google Maps
1. Na página inicial, o mapa deve carregar automaticamente
2. Deve mostrar quadras próximas na sua localização

## 🚨 Problemas Comuns

### Google Auth
- **"redirect_uri_mismatch"**: Verifique URLs no Google Console
- **"invalid_client"**: Verifique Client ID/Secret no Supabase
- **"requested path is invalid"**: Verifique Site URL no Supabase

### Google Maps
- **Mapa não carrega**: Verifique se a chave API está correta
- **"RefererNotAllowedMapError"**: Adicione seu domínio nas restrições
- **"ApiNotActivatedMapError"**: Ative as APIs necessárias

## ✅ Checklist Final

**Google Cloud Console:**
- [ ] Projeto criado
- [ ] 4 APIs ativadas (Google+, Maps JavaScript, Places, Geocoding)
- [ ] Tela de consentimento configurada
- [ ] Client ID OAuth criado
- [ ] Chave API criada e restringida

**Supabase:**
- [ ] Google provider ativado
- [ ] Client ID e Secret configurados
- [ ] URLs de redirecionamento configuradas

**Secrets:**
- [ ] GOOGLE_MAPS_API_KEY adicionada no Lovable

**Teste:**
- [ ] Login com Google funcionando
- [ ] Mapas carregando corretamente
- [ ] Busca de quadras funcionando

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todas as APIs estão ativadas
2. Confirme se as URLs estão exatas (sem espaços)
3. Teste em aba anônima do navegador
4. Verifique console do navegador para erros específicos

**Status**: Configuração completa quando todos os itens do checklist estiverem ✅