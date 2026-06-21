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

    document.getElementById('perfilNivel').textContent = dados.nivel;
    document.getElementById('perfilXP').textContent = dados.xpTotal + ' XP total';
    document.getElementById('perfilBarraXP').style.width = dados.xpNivel + '%';
    document.getElementById('perfilXPNivel').textContent = dados.xpNivel + '/100 XP neste nível';
    document.getElementById('perfilQuizzes').textContent = dados.quizzesConcluidos;
    document.getElementById('perfilMemorias').textContent = dados.jogosMemoriaConcluidos;
    document.getElementById('perfilProgresso').textContent = app.calcularProgressoGeral() + '%';

    mostrarImagemXP(app, dados.xpNivel);
    mostrarConquistas(app);
  }

  function mostrarImagemXP(app, xpNivel) {
    const area = document.getElementById('imagemXP');
    area.innerHTML = '';
    area.appendChild(
      app.criarImagem(
        app.obterImagemXP(xpNivel),
        'Imagem de progresso de XP',
        'imagem-progresso-xp'
      )
    );
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
