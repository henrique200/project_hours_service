# Horas‑Serviço (Expo / React Native)

App móvel para registrar horas trabalhadas, gerar relatórios mensais e gerenciar anotações, construído com **Expo Router**, **TypeScript** e **NativeWind**. Autenticação via **Firebase**. Persistência local com **AsyncStorage**.

---

## ✨ Visão geral
- **Cadastro de notas** com horas (0–24), observação opcional e flags (revisita/estudo com campos obrigatórios quando habilitados).
- **Relatórios mensais** com totais e destaque de revisitas/estudos.
- **Cronômetro persistente** (play/pause, stop) com limite de 24h e retomada automática. (Botão “iniciar” removido; agora apenas **play/pause** e **stop**.)
- **Fluxos de autenticação**: login, cadastro, esqueci a senha, redefinição de senha (via `oobCode`).
- **Validação com Yup**: erros inline nos inputs; modais apenas para sucesso/erros de backend.
- **UI/UX**: componentes reutilizáveis (ex.: `Button` com ícones), `ConfirmProvider` para diálogos, e formatação de tempo com utilitário `hoursToHorasEMinutos` (ex.: `02 horas e 02 minutos`).
- **Atualizado para Expo SDK 54** (avisos conhecidos como `SafeAreaView` são inofensivos).

---

## 🧱 Stack principal
- **React Native** (Expo) + **Expo Router** (arquitetura por pastas em `app/`)
- **TypeScript**
- **NativeWind** (Tailwind no RN)
- **Firebase Auth** (email/senha)
- **AsyncStorage** (persistência local)
- **Yup** (validação)

---

## 📂 Estrutura de pastas (resumo)
```
app/
  (auth)/
    login.tsx
    signup.tsx
    forgot-password.tsx
    reset-password.tsx
  notes/
    index.tsx            # Listagem (cards) + gerar relatório
    [id].tsx             # Criar/editar nota
  reports/
    index.tsx            # Lista de relatórios mensais
  timer/
    index.tsx            # Tela do cronômetro (play/pause, stop)
components/
  ui/
    Button.tsx           # Suporte a ícones (switch \"icon\")
context/
  AuthContext.tsx        # login, signup, logout, reset/confirm/change password
  NotesContext.tsx       # CRUD de notas + validações
  ReportsContext.tsx     # Geração, cache e exclusão de relatórios
  ConfirmProvider.tsx    # Modais de confirmação (useConfirm)
Functions/
  index.ts               # utils: todayIso, pad, splitHHMMSS, msToHoursDecimal
  time.ts                # hoursToHorasEMinutos
```

> Observação: Contextos tipados com `createContext<... | undefined>` e hooks guard (ex.: `useAuth`, `useNotes`).

---

## ⚙️ Requisitos
- Node 18+
- Expo CLI (ou `npx expo`)
- Conta Firebase (projeto com Auth Email/Password habilitado)

---

## 🔐 Variáveis de ambiente
Crie um arquivo **`.env`** na raiz (Expo lê chaves com prefixo `EXPO_PUBLIC_`):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

> Evite expor segredos fora do ambiente de desenvolvimento. As chaves públicas do Firebase são necessárias no cliente.

---

## 🚀 Instalação & Execução
```bash
# 1) Instalar deps\pnpm i # ou npm i / yarn

# 2) Rodar no dev client ou Expo Go
npx expo start

# 3) (opcional) Limpar cache se necessário
npx expo start -c
```

---

## 🧪 Scripts úteis
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 🧭 Navegação & Telas
- **(auth)**: `login`, `signup`, `forgot-password`, `reset-password` (consome `oobCode`).
- **notes**: listagem (cards com título `DD/MM/YYYY - 02 horas e 02 minutos`), criação/edição, exclusão com confirmação.
- **reports**: geração e listagem de relatórios por mês (FlatList de cards; exclusão com confirmação).
- **timer**: cronômetro persistente; `LIMIT_MS` = 24h; retoma estado após fechar app.

---

## 🧮 Validação & UX de formulários
- Esquemas com **Yup**, mensagens inline por campo.
- **Modais** apenas para sucesso geral (ex.: senha redefinida) ou erros vindos do backend.

---

## 💾 Persistência & Estado
- **AsyncStorage**: cronômetro (estado + timestamps) e caches leves.
- Contextos centralizam lógica e expõem hooks (`useAuth`, `useNotes`, `useReports`).

---

## 🧩 Componentes & Utilitários
- **Button**: suporta ícones via `switch (icon)` (ex.: \"play\", \"pause\", \"stop\").
- **hoursToHorasEMinutos**: exibe `N horas e M minutos` com zero‑pad.
- **ConfirmProvider/useConfirm**: confirmações reutilizáveis (ex.: excluir nota/relatório, sair da conta).

---

## 🛠️ Padrões de código
- TypeScript estrito onde possível.
- Estilos com **NativeWind** (classes utilitárias; evitar `StyleSheet` onde não necessário).
- Funções puras em `Functions/`, separando formatação e cálculo de UI.

---

## 📝 Commits & Branches
- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`...
- Para pequenos ajustes visuais/UX numa tela existente, usar `fix:` (ex.: `fix(timer): remove start button and polish pause state`).

---

## 🧯 Troubleshooting
- **Expo SDK 54**: avisos de `SafeAreaView` podem ser ignorados (não bloqueiam build).
- Se o Metro estiver inconsistente: `expo start -c`.
- Checar versões do Firebase modular e imports (`getApp()` etc.).

---

## 🗺️ Roadmap (curto prazo)
- Contadores no relatório: **total de Revisitas/Estudos**.
- Exportação de **CSV/PDF**.
- Filtros avançados na listagem de notas.

---

