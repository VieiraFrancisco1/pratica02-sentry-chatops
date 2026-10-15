require('dotenv').config({ quiet: true });
const Sentry = require('@sentry/node');

// O Sentry precisa iniciar antes de carregar o Express.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'development',
  sendDefaultPii: false,
});

const express = require('express');
const path = require('node:path');
const app = express();
const porta = Number(process.env.PORT) || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) => {
  res.json({ sentryConfigurado: Sentry.isEnabled() });
});

// Esta rota gera o erro que vamos procurar no painel do Sentry.
app.get('/debug-sentry', (req, res) => {
  throw new Error('Erro proposital da Prática 02');
});

// O Sentry captura a exceção antes da resposta ao navegador.
Sentry.setupExpressErrorHandler(app);

app.use((erro, req, res, next) => {
  console.error(erro.message);
  res.status(500).json({
    mensagem: erro.message,
    sentryConfigurado: Sentry.isEnabled(),
  });
});

app.listen(porta, '127.0.0.1', () => {
  console.log(`Aplicação em http://localhost:${porta}`);
  if (!Sentry.isEnabled()) {
    console.log('Preencha SENTRY_DSN no .env para enviar os erros ao Sentry.');
  }
});
