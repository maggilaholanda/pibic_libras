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
