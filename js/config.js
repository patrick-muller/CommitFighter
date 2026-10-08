// Constantes, elenco e textos do CommitFighter.
var CF = window.CF || (window.CF = {});

CF.W = 960;
CF.H = 540;
CF.GROUND = 500;
CF.WALL_L = 50;
CF.WALL_R = 910;
CF.ROUND_FRAMES = 60 * 60;
CF.MAX_HP = 1000;

// Índices das 16 poses de cada folha (ordem fixa dos prompts do Grok)
CF.FR = {
  IDLE_A: 0, IDLE_B: 1, WALK_A: 2, WALK_B: 3, JUMP: 4, PUNCH_WIND: 5, PUNCH: 6,
  KICK_WIND: 7, KICK: 8, BLOCK: 9, HIT: 10, SP_CHARGE: 11, SPECIAL: 12, SUPER: 13, KO: 14, WIN: 15
};

CF.KEYS = {
  p1: { left: 'KeyA', right: 'KeyD', up: 'KeyW', punch: 'KeyF', kick: 'KeyG', special: 'KeyH', super: 'KeyJ' },
  p2: { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', punch: 'KeyK', kick: 'KeyL', special: 'Semicolon', super: 'Quote' }
};

// Porcentagens iniciais = resultado real de eleicaobolhadev.com (presidente).
CF.ROSTER = [
  { id: 'deyvin', name: 'Mano Deyvin', handle: '@manodeyvin', pct: 20.85, color: '#9b5cff',
    normal: 'Fala, papai', special: 'Escala 7x0', super: 'Subiu a Rampa', quote: 'Fala, papai. Subiu.' },
  { id: 'galego', name: 'Augusto Galego', handle: '@RealGalego', pct: 10.62, color: '#c9a86a',
    normal: 'Visto de nômade', special: 'Curso relâmpago', super: 'Já era a verba', quote: 'Ferrou. Acabou a verba.' },
  { id: 'raul', name: 'Raul Sena', handle: '@oraulsena', pct: 10.0, color: '#3b5bdb',
    normal: 'Carguinho', special: 'Daily virou e-mail', super: 'Fim do rate limit', quote: 'Me oferece um carguinho.' },
  { id: 'sam', name: 'Sam Santos', handle: '@samsantosb', pct: 8.9, color: '#f5c518',
    normal: 'Promise pendente', special: 'BeeThreads', super: 'Ship-it', quote: 'Foi. Tá em prod.' },
  { id: 'montano', name: 'Lucas Montano', handle: '@lucas_montano', pct: 8.1, color: '#4fd8ff',
    normal: 'Laptop Positivo', special: 'Quinhentos estagiários', super: 'A bolha de antes', quote: 'Se hidrate.' },
  { id: 'sibelius', name: 'Sibelius Seraphini', handle: '@sseraphini', pct: 7.3, color: '#ff7a1a',
    normal: 'Isso não escala', special: 'Sem form', super: 'Pix no round', quote: 'Nada que precise de form escala.' },
  { id: 'akita', name: 'Fabio Akita', handle: '@AkitaOnRails', pct: 7.0, color: '#d9d9d9',
    normal: 'Bloqueio', special: 'Grito pras nuvens', super: 'ai-memory', quote: 'Se xingar, bloqueio.' },
  { id: 'vini', name: 'Vini Lana', handle: '@oviniciuslana', pct: 4.3, color: '#e03131',
    normal: 'Aula ao vivo', special: 'Academia', super: '37k inscritos', quote: 'Ó, repara aqui.' },
  { id: 'deschamps', name: 'Filipe Deschamps', handle: '@FilipeDeschamps', pct: 2.9, color: '#ffd43b',
    normal: 'Competência', special: 'Olha isso', super: 'Newsletter', quote: 'Quer se sentir competente?' },
  { id: 'claude', name: 'Claude', handle: '@claudeai', pct: null, color: '#e8743b', boss: true,
    normal: 'Recusa educada', special: 'Resposta longa', super: 'Estou pensando', quote: 'Posso ajudar com mais alguma coisa?' }
];

CF.byId = function (id) {
  for (var i = 0; i < CF.ROSTER.length; i++) if (CF.ROSTER[i].id === id) return CF.ROSTER[i];
  return null;
};

CF.CHAT = [
  'shipa', 'daily não', 'fala papai', 'isso não escala', 'KKKKKKK', 'build quebrou', 'merge na sexta?',
  'roda local', 'LGTM', 'quem testou?', 'bora pra prod', 'cadê o PR?', 'F', 'deu bom', 'tá em prod',
  'subiu a rampa', 'é curso?', 'e-mail não lido', 'promise pendente', 'carguinho?', 'olha isso',
  'posso ajudar?', 'commit sem teste', 'npm install', 'sem form', 'é pix?', 'ó, repara', '7x0',
  'rebase não', 'se hidrate', 'se hidrate!!', 'segunda é deploy', 'hotfix!!', 'tá lento', 'fura fila', 'combo!!', 'apelou'
];
CF.CHAT_USERS = ['dev_jr', 'tio_do_cobol', 'gopher', 'react_fan', 'vim_user', 'rustacean', 'estagiario',
  'pm_ansioso', 'qa_triste', 'devops', 'sre_cansado', 'fullstack', 'freela', 'nomade', 'cto'];
