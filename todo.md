# Sistema Financeiro para Igreja - React + Material-UI

## Objetivo
Criar um sistema financeiro completo para igreja usando React e Material-UI, seguindo os padrões do repositório de referência.

## Arquivos a Criar

### 1. Configuração e Tipos
- [ ] src/types/index.ts - Interfaces TypeScript (User, Balance, Tax, Report)
- [ ] src/config/api.ts - Configuração da API

### 2. Contextos
- [ ] src/contexts/AuthContext.tsx - Contexto de autenticação

### 3. Serviços
- [ ] src/services/authService.ts - Serviço de autenticação
- [ ] src/services/balanceService.ts - Serviço de balanço (entradas/saídas)
- [ ] src/services/taxService.ts - Serviço de taxas
- [ ] src/services/userService.ts - Serviço de usuários

### 4. Componentes
- [ ] src/components/Layout.tsx - Layout principal com sidebar
- [ ] src/components/PrivateRoute.tsx - Rota protegida

### 5. Páginas
- [ ] src/pages/Login.tsx - Página de login
- [ ] src/pages/Dashboard.tsx - Dashboard com resumos
- [ ] src/pages/Entradas.tsx - Gestão de entradas
- [ ] src/pages/Saidas.tsx - Gestão de saídas
- [ ] src/pages/Taxas.tsx - Gestão de taxas
- [ ] src/pages/Relatorios.tsx - Geração de relatórios
- [ ] src/pages/Usuarios.tsx - Gestão de usuários

### 6. App Principal
- [ ] src/App.tsx - Configuração de rotas e tema Material-UI
- [ ] src/main.tsx - Entry point
- [ ] index.html - HTML principal

## Características
- Design responsivo com Material-UI
- Modo escuro
- Autenticação com localStorage
- Gestão completa de finanças
- Relatórios com filtros
- Gráficos e estatísticas