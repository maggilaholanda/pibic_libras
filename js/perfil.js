/* =========================================================
   Perfil do aluno
   Mostra XP, nível, progresso geral e conquistas.
   ========================================================= */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', iniciarPerfil);

  function iniciarPerfil() {
    if ((document.body.dataset.page || '') !== 'perfil') return;

    const app = window.LibrasApp;
    const dados = app.carregarProgresso();
    const nome = document.getElementById('nomePerfil');
    const salvarNome = document.getElementById('btnSalvarNome');
    const feedbackNome = document.getElementById('feedbackNome');

    nome.value = dados.nome || '';
    salvarNome.addEventListener('click', function () {
      dados.nome = nome.value.trim();
      app.salvarProgresso(dados);
      feedbackNome.textContent = dados.nome ? 'Nome salvo.' : 'Nome removido.';
    });

    document.getElementById('perfilNivel').textContent = dados.nivel;
    document.getElementById('perfilXP').textContent = dados.xpTotal + ' XP total';
    document.getElementById('perfilBarraXP').style.width = dados.xpNivel + '%';
    document.getElementById('perfilXPNivel').textContent = dados.xpNivel + '/100 XP neste nível';
    document.getElementById('perfilQuizzes').textContent = dados.quizzesConcluidos;
    document.getElementById('perfilMemorias').textContent = dados.jogosMemoriaConcluidos;
    document.getElementById('perfilProgresso').textContent = app.calcularProgressoGeral() + '%';
    const letrasVistas = Array.isArray(dados.alfabetoVisto) ? dados.alfabetoVisto.length : 0;
    document.getElementById('perfilAlfabeto').textContent = letrasVistas + '/26 letras visualizadas';
    document.getElementById('perfilMelhorQuiz').textContent = (dados.melhorQuizPercentual || 0) + '%';
    document.getElementById('perfilTotalQuizzes').textContent = dados.quizzesConcluidos;
    document.getElementById('perfilTotalMemorias').textContent = dados.jogosMemoriaConcluidos;
    document.getElementById('perfilMelhorMemoria').textContent = (dados.melhorMemoriaPontuacao || 0) + ' pontos';
    document.getElementById('perfilXPTotal').textContent = dados.xpTotal + ' XP';
    const mensagem = document.getElementById('mensagemProgresso');

    if (letrasVistas < 26) {
      mensagem.textContent = 'Faltam ' + (26 - letrasVistas) + ' letras para você completar o alfabeto.';
    } else if (!dados.quizzesConcluidos) {
      mensagem.textContent = 'Você já viu todo o alfabeto. Que tal testar seus conhecimentos no Quiz?';
    } else {
      mensagem.textContent = 'Você já pode continuar praticando no Quiz ou no jogo da Memória.';
    }

    // Não exibe mais imagem de XP a partir de arquivo externo.
    mostrarConquistas(app);
  }

  function mostrarConquistas(app) {
    const lista = document.getElementById('listaConquistas');
    const conquistas = app.calcularConquistas();

    lista.innerHTML = '';

    conquistas.forEach(function (conquista) {
      const item = document.createElement('article');
      item.className = 'conquista' + (conquista.liberada ? '' : ' bloqueada');

      item.appendChild(app.criarImagem(conquista.imagem, 'Imagem da conquista ' + conquista.titulo));

      const titulo = document.createElement('strong');
      titulo.textContent = conquista.liberada ? conquista.titulo : 'Bloqueada';

      const descricao = document.createElement('small');
      descricao.textContent = conquista.descricao;

      item.appendChild(titulo);
      item.appendChild(descricao);
      lista.appendChild(item);
    });
  }
})();
