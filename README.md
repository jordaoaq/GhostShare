# 👻 GhostShare

> **Compartilhe arquivos como um fantasma.** Sem servidores, sem rastros, apenas você e seu par.

GhostShare é uma aplicação de compartilhamento de arquivos P2P segura e sem servidor, projetada para privacidade e velocidade. Ele usa WebRTC para estabelecer uma conexão direta entre os pares, garantindo que seus arquivos **nunca** toquem em um servidor. O servidor atua apenas como um mecanismo de sinalização para apresentar os pares um ao outro.

## ✨ Funcionalidades

- **🔒 Privacidade em Primeiro Lugar**: Arquivos são transferidos diretamente entre navegadores. Sem bancos de dados, sem buckets S3, sem logs.
- **⚡ Extremamente Rápido**: Conexão P2P significa sem gargalos de servidor. A velocidade de transferência é limitada apenas pela sua rede.
- **📦 Sem Limites de Tamanho**: Impulsionado pelo **StreamSaver.js**, o GhostShare transmite arquivos diretamente para o seu disco, contornando limites de memória. Compartilhe arquivos de 10GB+ sem travar seu navegador.
- **💬 Chat em Tempo Real**: Chat seguro e efêmero entre os pares.
- **📜 Histórico de Arquivos**: Acompanhe o que você enviou e recebeu durante a sessão.
- **🌐 Arquitetura Monorepo**: Construído com uma stack moderna, pronto para fácil deploy.

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
   git clone https://github.com/seu-usuario/ghostshare.git
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

## ⚠️ Nota sobre "Strict Mode"

O React Strict Mode está ativado para melhores práticas de desenvolvimento. Se você encontrar peculiaridades de conexão no modo dev, tente atualizar ambas as abas. Em builds de produção, isso não é um problema.

---

Feito com 💙 por [Seu Nome]
