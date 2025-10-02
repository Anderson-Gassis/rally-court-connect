# 🧪 Testes Automatizados - Kourtify

## Sobre os Testes

Este projeto utiliza **Vitest** e **React Testing Library** para garantir a qualidade e confiabilidade do código.

## 📦 Dependências de Teste

- `vitest` - Framework de testes rápido e moderno
- `@testing-library/react` - Utilitários para testar componentes React
- `@testing-library/jest-dom` - Matchers personalizados para o DOM
- `@testing-library/user-event` - Simulação de interações do usuário
- `jsdom` - Ambiente DOM para testes

## 🚀 Executando os Testes

```bash
# Executar todos os testes
npm run test

# Executar testes em modo watch (recarrega ao fazer alterações)
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes de um arquivo específico
npm run test src/lib/validations/__tests__/auth.test.ts
```

## 📁 Estrutura dos Testes

```
src/
├── lib/
│   ├── validations/
│   │   ├── __tests__/
│   │   │   ├── auth.test.ts
│   │   │   └── booking.test.ts
│   │   ├── auth.ts
│   │   └── booking.ts
│   └── __tests__/
│       ├── rate-limiter.test.ts
│       └── analytics.test.ts
├── components/
│   ├── __tests__/
│   │   └── CourtRating.test.tsx
│   └── CourtRating.tsx
└── test/
    └── setup.ts
```

## 🧪 Tipos de Testes

### 1. Testes de Validação

**Localização**: `src/lib/validations/__tests__/`

Testam as funções de validação de dados:
- ✅ Validação de email
- ✅ Validação de senha
- ✅ Validação de dados de login
- ✅ Validação de dados de cadastro
- ✅ Validação de dados de reserva
- ✅ Validação de data/hora

**Exemplo**:
```typescript
it('should accept valid email addresses', () => {
  const result = validateEmail('user@example.com');
  expect(result.success).toBe(true);
});
```

### 2. Testes de Componentes

**Localização**: `src/components/__tests__/`

Testam o comportamento e renderização dos componentes React:
- ✅ Renderização correta
- ✅ Exibição de dados
- ✅ Estados e props
- ✅ Responsividade

**Exemplo**:
```typescript
it('should render rating with stars', () => {
  render(<CourtRating rating={4.5} reviewCount={10} />);
  expect(screen.getByText('4.5')).toBeInTheDocument();
});
```

### 3. Testes de Utilitários

**Localização**: `src/lib/__tests__/`

Testam funções utilitárias:
- ✅ Rate limiting
- ✅ Analytics tracking
- ✅ Helpers diversos

## 📊 Cobertura de Testes

Os testes atuais cobrem:
- ✅ **Validações**: 100% das funções de validação
- ✅ **Rate Limiter**: 100% do código de rate limiting
- ✅ **Analytics**: 100% do sistema de analytics
- ✅ **Componentes**: Componentes críticos como CourtRating

## 🎯 Boas Práticas

1. **Nomenclatura**: Use nomes descritivos que expliquem o que está sendo testado
2. **Isolamento**: Cada teste deve ser independente
3. **AAA Pattern**: Arrange (preparar), Act (executar), Assert (verificar)
4. **Mocks**: Use mocks para dependências externas
5. **Coverage**: Busque alta cobertura em código crítico

## 🔄 CI/CD

Os testes são executados automaticamente:
- ✅ Antes de cada commit (com Husky)
- ✅ Em pull requests
- ✅ Antes do deploy em produção

## 📝 Adicionando Novos Testes

### Para testar uma função:

```typescript
import { describe, it, expect } from 'vitest';
import { minhaFuncao } from '../minhaFuncao';

describe('MinhaFuncao', () => {
  it('should do something', () => {
    const result = minhaFuncao('input');
    expect(result).toBe('expected');
  });
});
```

### Para testar um componente:

```typescript
import { render, screen } from '@testing-library/react';
import MeuComponente from '../MeuComponente';

describe('MeuComponente', () => {
  it('should render correctly', () => {
    render(<MeuComponente prop="value" />);
    expect(screen.getByText('value')).toBeInTheDocument();
  });
});
```

## 🐛 Debugging Testes

```bash
# Executar um teste específico em modo debug
npm run test -- --reporter=verbose src/path/to/test.ts

# Ver output detalhado
npm run test -- --reporter=verbose
```

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎉 Próximos Passos

- [ ] Adicionar testes E2E com Playwright
- [ ] Aumentar cobertura de testes de componentes
- [ ] Adicionar testes de integração
- [ ] Configurar relatórios de cobertura automáticos
