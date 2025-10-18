# PWA Setup - Kourtify

## 🚀 Aplicação Web Progressiva (PWA)

O Kourtify agora é uma Progressive Web App (PWA), permitindo que usuários instalem o aplicativo diretamente no dispositivo móvel.

## ✨ Funcionalidades PWA

- **Instalação na tela inicial**: Usuários podem adicionar o app à tela inicial do dispositivo
- **Funcionamento offline**: Cache de recursos para acesso offline básico
- **Notificações**: Preparado para notificações push (requer configuração adicional)
- **Experiência nativa**: Interface completa como um app nativo
- **Atualizações automáticas**: Service Worker atualiza o app automaticamente

## 📱 Como Instalar

### iOS (iPhone/iPad)
1. Abra o site no Safari
2. Toque no botão de compartilhar (ícone ↑)
3. Role para baixo e toque em "Adicionar à Tela de Início"
4. Confirme tocando em "Adicionar"

### Android
1. Abra o site no Chrome
2. Toque no menu (⋮) no canto superior direito
3. Toque em "Instalar app" ou "Adicionar à tela inicial"
4. Confirme tocando em "Instalar"

### Desktop (Chrome/Edge)
1. Visite o site
2. Clique no ícone de instalação na barra de endereços
3. Confirme a instalação

## 🛠️ Arquivos PWA

- **`public/manifest.webmanifest`**: Configuração do PWA (nome, ícones, cores)
- **`public/icon-192x192.png`**: Ícone 192x192
- **`public/icon-512x512.png`**: Ícone 512x512
- **`public/screenshot-mobile.png`**: Screenshot mobile para app stores
- **`public/screenshot-desktop.png`**: Screenshot desktop para app stores
- **`vite.config.ts`**: Configuração do plugin PWA com Workbox
- **`src/hooks/usePWA.tsx`**: Hook para controlar instalação
- **`src/components/PWAInstallBanner.tsx`**: Banner de instalação
- **`src/pages/Install.tsx`**: Página dedicada de instalação

## 🔧 Configurações Técnicas

### Service Worker
O Service Worker é gerado automaticamente pelo `vite-plugin-pwa` e inclui:
- Cache de assets estáticos (JS, CSS, HTML, imagens)
- NetworkFirst para chamadas Supabase
- Atualização automática do cache

### Cache Strategy
- **Assets estáticos**: Cache-first (performance máxima)
- **API Supabase**: Network-first (dados sempre atualizados)
- **Expiração**: 24 horas para cache de API

## 📊 Métricas PWA

Para testar a qualidade do PWA:
1. Abra Chrome DevTools
2. Vá em "Lighthouse"
3. Selecione "Progressive Web App"
4. Execute a auditoria

Meta: Score > 90

## 🚀 Deploy

Para que o PWA funcione em produção:

1. **HTTPS obrigatório**: PWA requer HTTPS (exceto localhost)
2. **Service Worker registrado**: Automático após build
3. **Manifest linkado**: Já configurado no `index.html`

### Build para produção
```bash
npm run build
```

O service worker será gerado automaticamente em `dist/sw.js`

## 🔄 Atualizações

O service worker detecta atualizações automaticamente e:
1. Baixa novos assets em background
2. Instala a nova versão
3. Ativa na próxima visita do usuário

Para forçar atualização imediata, usuários podem:
- Fechar e reabrir o app
- Usar "Recarregar" no navegador

## 🎯 Próximos Passos para App Nativo

Quando estiver pronto para criar um app nativo real (iOS/Android):

### Capacitor Setup
```bash
# 1. Instalar Capacitor (já instalado)
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# 2. Build do projeto
npm run build

# 3. Adicionar plataformas
npx cap add ios
npx cap add android

# 4. Sync do código
npx cap sync

# 5. Abrir no Xcode (iOS) ou Android Studio
npx cap open ios
npx cap open android
```

### Diferenças PWA vs Nativo
| Recurso | PWA | Nativo (Capacitor) |
|---------|-----|-------------------|
| Instalação | Navegador | App Store / Play Store |
| Push Notifications | Limitado | Completo |
| Acesso à câmera | Limitado | Completo |
| Sensores | Parcial | Completo |
| Performance | Boa | Excelente |
| Setup | Simples | Complexo |
| Distribuição | Imediata | Requer aprovação |

## 📞 Suporte

Para dúvidas sobre PWA:
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
