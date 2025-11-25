# 👻 GhostShare

> **Compartilhe arquivos como um fantasma.** Sem servidores, sem rastros, apenas você e seu par.

GhostShare é uma aplicação de compartilhamento de arquivos P2P segura e sem servidor, projetada para privacidade e velocidade. Ele usa WebRTC para estabelecer uma conexão direta entre os pares, garantindo que seus arquivos **nunca** toquem em um servidor. O servidor atua apenas como um mecanismo de sinalização para apresentar os pares um ao outro.

## 🚀 Demo ao Vivo

Experimente agora: **[ghostshare-p2p.vercel.app](https://ghostshare-p2p.vercel.app)**

## ✨ Funcionalidades

- **🔒 Privacidade em Primeiro Lugar**: Arquivos são transferidos diretamente entre navegadores. Sem bancos de dados, sem buckets S3, sem logs.
- **⚡ Extremamente Rápido**: Conexão P2P significa sem gargalos de servidor. A velocidade de transferência é limitada apenas pela sua rede.
- **📦 Sem Limites de Tamanho**: Impulsionado pelo **StreamSaver.js**, o GhostShare transmite arquivos diretamente para o seu disco, contornando limites de memória. Compartilhe arquivos de 10GB+ sem travar seu navegador.
- **💬 Chat em Tempo Real**: Chat seguro e efêmero entre os pares.
- **📜 Histórico de Arquivos**: Acompanhe o que você enviou e recebeu durante a sessão.
- **🌐 Conectividade Robusta**: Usa múltiplos servidores STUN públicos (Google, Twilio, Mozilla) para garantir conexões P2P mesmo através de firewalls restritivos.
- **🎨 Interface Moderna**: Design responsivo com Tailwind CSS e efeitos visuais interativos.

## 🛠️ Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.io (Sinalização)
- **P2P Core**: Simple-peer (WebRTC)
- **Streaming**: StreamSaver.js

## 🏃‍♂️ Como Rodar

### Pré-requisitos

- Node.js (v18+)

### Início Rápido

1. **Clone e Instale**

   ```bash

   git clone https://github.com/jordaoaq/ghostshare.git
   cd ghostshare
   npm run install:all
   ```

2. **Build**

   ```bash

   npm run build
   ```

3. **Iniciar**

   ```bash

   npm start
   ```

   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### Modo de Desenvolvimento

Rode o frontend e o backend simultaneamente com hot-reload:

```bash
npm run dev
```

## 📖 Como Usar

1. Clique em **"Create Room"** na página inicial.
2. Compartilhe a **URL da Sala** gerada com um amigo.
3. Aguarde o indicador **"Peer Connected"** ficar verde.
4. **Arraste e Solte** qualquer arquivo para começar a compartilhar!
5. Use o chat para se comunicar com segurança.

## 🌐 Deploy em Produção

### Frontend (Vercel)

1. Faça fork do repositório
2. Conecte sua conta Vercel ao GitHub
3. Configure o projeto:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Adicione a variável de ambiente:
   - `VITE_SOCKET_URL`: URL do seu servidor Socket.io (ex: `https://seu-app.onrender.com`)

### Backend (Render)

1. Crie um novo **Web Service** no Render
2. Conecte ao repositório GitHub
3. Configure:
   - **Root Directory**: `.` (raiz)
   - **Build Command**: `npm run install:all && npm run build:client && npm run build:server`
   - **Start Command**: `npm start`
4. O servidor estará disponível na URL fornecida pelo Render

> **Nota**: Certifique-se de atualizar a lista de origens CORS no `server/index.ts` com a URL do seu frontend Vercel.

---

Feito com 💙 por [jordaoaq](https://github.com/jordaoaq)
