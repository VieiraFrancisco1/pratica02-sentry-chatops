const botao = document.getElementById('gerar-erro');
const statusSentry = document.getElementById('status');
const resultado = document.getElementById('resultado');

async function verificarConfiguracao() {
  try {
    const resposta = await fetch('/api/status');
    if (!resposta.ok) throw new Error('Falha ao consultar a configuração.');
    const dados = await resposta.json();

    if (dados.sentryConfigurado) {
      statusSentry.textContent = 'DSN configurada. A confirmação do envio será feita no painel do Sentry.';
    } else {
      statusSentry.textContent = 'Falta configurar SENTRY_DSN no .env e reiniciar o servidor.';
      statusSentry.classList.add('aviso');
    }
  } catch (erro) {
    statusSentry.textContent = 'Não foi possível consultar o servidor. Confira se ele está em execução.';
    statusSentry.classList.add('aviso');
  }
}

botao.addEventListener('click', async () => {
  botao.disabled = true;
  botao.textContent = 'Gerando erro...';
  resultado.hidden = false;
  resultado.textContent = 'Aguardando a resposta do servidor...';

  try {
    const resposta = await fetch('/debug-sentry');
    const dados = await resposta.json();
    if (resposta.status !== 500) throw new Error('Resposta inesperada do servidor.');

    resultado.textContent = `HTTP ${resposta.status}: ${dados.mensagem}\n\n`;
    if (dados.sentryConfigurado) {
      resultado.textContent += 'Agora confira o erro na aba Issues do Sentry.';
    } else {
      resultado.textContent += 'O erro foi gerado localmente. Preencha a DSN no .env para enviar ao Sentry.';
    }
  } catch (erro) {
    resultado.textContent = 'Não foi possível concluir o teste. Confira o terminal e tente novamente.';
  } finally {
    botao.disabled = false;
    botao.textContent = 'Gerar erro de teste';
  }
});

verificarConfiguracao();
