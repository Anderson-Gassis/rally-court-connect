# Configuração do Google Maps - Guia Completo

## 🔑 API Key Atual
A API key já está configurada nos secrets do Supabase: `GOOGLE_MAPS_API_KEY`

**Valor atual**: `AIzaSyBoSkK57dZoIh6tVDaEvUM1AhnHdKVtawI`

## ✅ Checklist de Configuração no Google Cloud Console

### 1. Acesse o Google Cloud Console
- URL: https://console.cloud.google.com/
- Selecione seu projeto ou crie um novo

### 2. Habilite as APIs Necessárias
Vá em "APIs & Services" → "Enable APIs and Services" e habilite:

- ✅ **Maps JavaScript API** (obrigatório)
- ✅ **Places API** (obrigatório)
- ✅ **Geocoding API** (recomendado)
- ✅ **Geolocation API** (opcional)

### 3. Configure a API Key

#### 3.1 Restrições de Aplicativo
**IMPORTANTE**: Configure restrições corretas para segurança

1. Vá em "APIs & Services" → "Credentials"
2. Clique na sua API key
3. Em "Application restrictions", selecione:
   - **HTTP referrers (websites)** para produção
   
4. Adicione os domínios permitidos:
   ```
   https://otiqpklbednbytyvaoah.supabase.co/*
   https://*.lovableproject.com/*
   https://*.lovable.app/*
   http://localhost:*/*
   http://127.0.0.1:*/*
   ```

#### 3.2 Restrições de API
1. Em "API restrictions", selecione "Restrict key"
2. Marque apenas as APIs que você habilitou:
   - Maps JavaScript API
   - Places API
   - Geocoding API

### 4. Billing (OBRIGATÓRIO)
O Google Maps exige billing habilitado mesmo com o free tier:

1. Vá em "Billing" → "Link a billing account"
2. Configure um método de pagamento
3. **Free tier**: $200 de crédito mensal (geralmente suficiente para apps pequenos)

### 5. Teste a Configuração

#### Teste 1: Verificar se a API Key funciona
```bash
curl "https://maps.googleapis.com/maps/api/js?key=SUA_API_KEY&libraries=places"
```

#### Teste 2: Verificar permissões
Acesse a aplicação e abra o DevTools Console:
- Se ver erros de "RefererNotAllowedMapError": Ajuste as restrições de referrer
- Se ver erros de "ApiNotActivatedMapError": Habilite as APIs necessárias
- Se ver erros de "BillingNotEnabledMapError": Configure o billing

## 🔧 Troubleshooting

### Erro: "This API project is not authorized to use this API"
**Solução**: Habilite a Maps JavaScript API no projeto

### Erro: "The provided API key is invalid"
**Solução**: Verifique se a API key está correta e sem caracteres extras

### Erro: "RefererNotAllowedMapError"
**Solução**: Adicione o domínio do app nas restrições de referrer

### Erro: "ApiNotActivatedMapError"
**Solução**: Habilite a API específica mencionada no erro

### Erro: "REQUEST_DENIED" ou "OVER_QUERY_LIMIT"
**Solução**: 
1. Verifique se o billing está habilitado
2. Verifique os limites de quota no console

## 📊 Monitoramento de Uso

1. Vá em "APIs & Services" → "Dashboard"
2. Selecione a API (ex: Maps JavaScript API)
3. Veja as métricas de uso e quotas

### Quotas Importantes:
- **Maps JavaScript API**: 28,000 carregamentos/mês grátis
- **Places API**: $200 crédito mensal
- **Geocoding API**: $200 crédito mensal

## 🚀 Próximos Passos

1. [ ] Verificar billing está habilitado
2. [ ] Confirmar todas as APIs necessárias estão habilitadas
3. [ ] Configurar restrições de domínio para segurança
4. [ ] Testar em produção
5. [ ] Monitorar uso mensal

## 📝 Notas Importantes

- **Segurança**: NUNCA exponha a API key diretamente no código frontend
- **Edge Function**: A API key é servida via edge function `get-maps-config`
- **Cache**: Mudanças nas configurações podem levar alguns minutos para propagar
- **Produção**: Configure restrições de domínio antes do lançamento público

## 🔗 Links Úteis

- [Google Maps Platform Console](https://console.cloud.google.com/google/maps-apis)
- [Documentação Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Preços e Quotas](https://mapsplatform.google.com/pricing/)
- [Troubleshooting Guide](https://developers.google.com/maps/documentation/javascript/error-messages)
