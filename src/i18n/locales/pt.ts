import type en from './en'

const pt: typeof en = {
  app: {
    name: 'bloub',
    title: 'bloub — avatar SVG animado',
    description:
      'bloub recria o avatar do bot do x.ai como um SVG animado: uma forma preta que transita entre 14 estados, medidos pixel a pixel do vídeo. Sem biblioteca de animação.',
    botAria: 'Avatar bloub animado'
  },

  gallery: {
    back: 'Voltar ao reprodutor'
  },

  rail: {
    nav: 'Seções',
    customize: 'Personalizar',
    animations: 'Animações',
    settings: 'Configurações'
  },

  panel: {
    animations: 'Animação',
    shape: 'Forma',
    expression: 'Expressão',
    color: 'Cor'
  },

  export: {
    action: 'Exportar como PNG',
    more: 'Outros formatos',
    png: 'Baixar PNG',
    svg: 'Baixar SVG',
    anime: 'Baixar SVG animado',
    gif: 'Baixar GIF animado',
    cycleDetail: 'O vídeo é mais leve e fluido; o GIF funciona em qualquer lugar.',
    cycleFormat: 'Formato',
    cycle_mp4: 'Vídeo MP4',
    cycle_mp4_aide: 'Leve e fluido, precisa de fundo',
    cycle_gif: 'GIF animado',
    cycle_gif_aide: 'Funciona em qualquer lugar, mais pesado',
    cycleProgress: 'Exportando…',
    cycleReessayer: 'Tentar novamente',
    gifTitle: 'Baixar GIF animado',
    gifDetail:
      'A transparência do GIF é tudo ou nada: sem fundo, a borda da bola fica um pouco dura.',
    gifBackground: 'Fundo',
    fond_blanc: 'Fundo branco',
    fond_blanc_aide: 'Borda suave, para superfícies claras',
    fond_transparent: 'Fundo transparente',
    fond_transparent_aide: 'Funciona sobre qualquer fundo, borda um pouco dura',
    gifConfirm: 'Baixar',
    copie: 'Copiar imagem',
    copieSvg: 'Copiar SVG',
    done: 'Exportado',
    copied: 'Copiado',
    failed: 'Erro ao exportar'
  },

  preview: {
    exit: 'Sair da visualização',
    key: 'Esc'
  },

  timeline: {
    play: 'Reproduzir',
    pause: 'Pausar',
    addAnimation: 'Adicionar uma animação',
    preview: 'Visualização',
    export: 'Exportar a montagem',
    zoom: 'Zoom da faixa',
    blockAria: '{state}, {duration}',
    blockDurationAria: 'Duração de {state}, {duration}',
    blockRemoveAria: 'Remover {state}'
  },

  dialog: {
    cancel: 'Cancelar',
    nameCreateTitle: 'Novo ciclo',
    nameRenameTitle: 'Renomear ciclo',
    nameField: 'Nome do ciclo',
    nameCreate: 'Criar',
    nameRename: 'Renomear',
    removeTitle: 'Excluir «{name}»?',
    removeDetail:
      'Esta sequência será perdida, junto com sua animação. | Esta sequência será perdida, junto com suas {n} animações.',
    removeConfirm: 'Excluir'
  },

  cycles: {
    defaultName: 'Ciclo padrão',
    newName: 'Meu ciclo',
    menuNew: 'Novo ciclo',
    menuRenameAria: 'Renomear {name}',
    menuRemoveAria: 'Excluir {name}'
  },

  units: {
    seconds: '{n} s',
    secondsShort: '{n}s'
  },

  settings: {
    title: 'Configurações',
    language: 'Idioma',
    about: 'Sobre',
    credits: 'Feito com ❤️ por {name}',
    creditsAria: 'Jérémy no X, em uma nova aba',
    github: 'Ver o projeto no GitHub',
    githubAria: 'O repositório do projeto no GitHub, em uma nova aba'
  },

  meetup: {
    title: 'Grok Bot',
    question: 'What should I build with my Grok Bots?',
    presented: 'Apresentado por',
    city: 'Meetup {place}',
    cityBare: 'Meetup',
    cityClaim: 'Créditos do meetup',
    welcome: 'Bem-vindo, {name}',
    claim: 'Resgatar créditos',
    back: 'Voltar',
    tabTitle: 'Grok Bot Meetup',
    description: 'Check-in e créditos do Cursor.'
  },

  wall: {
    edit: 'Editar',
    done: 'Pronto',
    title: 'Editar mural',
    language: 'Idioma',
    place: 'Cidade',
    morph: 'Mudar a cada',
    morphUnit: 's',
    claimUrl: 'QR de créditos',
    qrEmpty: 'Adicione uma URL para gerar o QR.',
    repo: 'Ver o repositório',
    repoAria: 'Este projeto no GitHub, em uma nova aba'
  },

  states: {
    idle: 'Repouso',
    thinking: 'Pensando',
    wink: 'Piscada',
    wide: 'Olhos abertos',
    alert: 'Alerta',
    notify: 'Notificação',
    exclaim: 'Exclamação',
    sleep: 'Sono',
    egg: 'Ovo',
    hexagon: 'Hexágono',
    play: 'Reproduzir',
    orbit: 'Órbita',
    burst: 'Explosão',
    comet: 'Cometa',
    swirl: 'Redemoinho'
  },

  shapes: {
    cercle: 'Círculo',
    galet: 'Seixo',
    squircle: 'Superelipse',
    capsule: 'Cápsula',
    triangle: 'Triângulo',
    hexagone: 'Hexágono',
    nuage: 'Nuvem',
    goutte: 'Gota'
  },

  colors: {
    encre: 'Tinta',
    creme: 'Creme',
    brun: 'Marrom',
    rouge: 'Vermelho',
    orange: 'Laranja',
    ambre: 'Âmbar',
    vert: 'Verde',
    turquoise: 'Turquesa',
    bleu: 'Azul',
    violet: 'Violeta',
    rose: 'Rosa',
    gris: 'Cinza'
  },

  expressions: {
    neutre: 'Neutro',
    attentif: 'Atento',
    surpris: 'Surpreso',
    excite: 'Empolgado',
    heureux: 'Feliz',
    hilare: 'Rindo',
    colere: 'Bravo',
    triste: 'Triste',
    effraye: 'Assustado',
    mefiant: 'Desconfiado',
    confus: 'Confuso',
    curieux: 'Curioso',
    fier: 'Orgulhoso',
    timide: 'Tímido',
    blase: 'Indiferente',
    somnolent: 'Sonolento'
  }
}

export default pt
