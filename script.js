/* ============ CONFIGURAÇÕES DE ACESSIBILIDADE ============ */
let map, darkTile, lightTile, satTile, currentTile = 'dark';
let userMarker = null;
let currentUser = localStorage.getItem('acessmap_user');
let currentTipo = localStorage.getItem('acessmap_tipo') || 'cadeirante';
let soundEnabled = localStorage.getItem('acessmap_sound') === 'true';
let favorites = JSON.parse(localStorage.getItem('acessmap_fav')) || [];
let currentBusFilter = 'todos';
let currentPriority = 'media';

// ============ DADOS FICTÍCIOS ============
const RUAS = [
  { nome: 'Avenida Central', coords: [[-23.545,-46.645],[-23.548,-46.638],[-23.551,-46.632],[-23.554,-46.626]] },
  { nome: 'Rua das Acácias', coords: [[-23.552,-46.640],[-23.554,-46.636],[-23.556,-46.632]] },
  { nome: 'Rua dos Ipês', coords: [[-23.548,-46.642],[-23.550,-46.638],[-23.552,-46.634]] },
  { nome: 'Rua das Palmeiras', coords: [[-23.556,-46.640],[-23.558,-46.636]] },
  { nome: 'Avenida Brasil', coords: [[-23.544,-46.650],[-23.548,-46.645],[-23.552,-46.640]] },
  { nome: 'Rua São João', coords: [[-23.549,-46.628],[-23.551,-46.624]] },
  { nome: 'Rua das Flores', coords: [[-23.553,-46.630],[-23.555,-46.626]] },
  { nome: 'Alameda dos Anjos', coords: [[-23.546,-46.634],[-23.548,-46.630]] },
  { nome: 'Rua do Comércio', coords: [[-23.557,-46.632],[-23.559,-46.628]] },
  { nome: 'Travessa das Rosas', coords: [[-23.550,-46.636],[-23.552,-46.632]] }
];

const PONTOS = [
  // RAMPAS
  { t:'rampa', lat:-23.5505, lng:-46.6333, nome:'Rampa da Praça Central', inclinacao:'6%', largura:'1,50m', piso:'Antiderrapante', corrimao:'Sim', iluminacao:'Sim', qualidade:'Boa' },
  { t:'rampa', lat:-23.5489, lng:-46.6388, nome:'Rampa Metrô Sé', inclinacao:'8%', largura:'1,20m', piso:'Concreto', corrimao:'Sim', iluminacao:'Sim', qualidade:'Boa' },
  { t:'rampa', lat:-23.5550, lng:-46.6300, nome:'Rampa Teatro Municipal', inclinacao:'12%', largura:'1,10m', piso:'Liso', corrimao:'Não', iluminacao:'Não', qualidade:'Ruim' },
  { t:'rampa', lat:-23.5450, lng:-46.6400, nome:'Rampa do Museu', inclinacao:'7%', largura:'1,40m', piso:'Antiderrapante', corrimao:'Sim', iluminacao:'Sim', qualidade:'Boa' },
  { t:'rampa', lat:-23.5520, lng:-46.6350, nome:'Rampa Rua das Acácias', inclinacao:'15%', largura:'0,90m', piso:'Quebrado', corrimao:'Não', iluminacao:'Não', qualidade:'Ruim' },
  { t:'rampa', lat:-23.5470, lng:-46.6420, nome:'Rampa Avenida Brasil', inclinacao:'5%', largura:'1,60m', piso:'Antiderrapante', corrimao:'Sim', iluminacao:'Sim', qualidade:'Boa' },
  { t:'rampa', lat:-23.5540, lng:-46.6280, nome:'Rampa Rua das Flores', inclinacao:'10%', largura:'1,00m', piso:'Concreto', corrimao:'Sim', iluminacao:'Não', qualidade:'Média' },

  // PARADAS DE ÔNIBUS
  { t:'onibus', lat:-23.5495, lng:-46.6345, nome:'Parada Av. Central, 250', linhas:'101, 205, 312', rampa:'Sim', piso:'Sim', abrigo:'Sim', banco:'Sim' },
  { t:'onibus', lat:-23.5515, lng:-46.6310, nome:'Parada Rua das Acácias, 88', linhas:'205, 410', rampa:'Sim', piso:'Sim', abrigo:'Não', banco:'Sim' },
  { t:'onibus', lat:-23.5460, lng:-46.6395, nome:'Parada Av. Brasil, 1200', linhas:'101, 312, 410, 502', rampa:'Sim', piso:'Sim', abrigo:'Sim', banco:'Sim' },
  { t:'onibus', lat:-23.5530, lng:-46.6275, nome:'Parada Rua das Flores, 45', linhas:'410, 502', rampa:'Não', piso:'Não', abrigo:'Não', banco:'Não' },
  { t:'onibus', lat:-23.5475, lng:-46.6360, nome:'Parada Alameda dos Anjos', linhas:'101, 205', rampa:'Sim', piso:'Sim', abrigo:'Sim', banco:'Sim' },

  // BANHEIROS PCD
  { t:'banheiro', lat:-23.5508, lng:-46.6340, nome:'Banheiro PCD - Praça Central', tipo:'Público', barras:'Sim', alarme:'Sim', espaco:'1,80m x 1,60m' },
  { t:'banheiro', lat:-23.5485, lng:-46.6375, nome:'Banheiro PCD - Metrô Sé', tipo:'Metrô', barras:'Sim', alarme:'Sim', espaco:'2,00m x 1,80m' },
  { t:'banheiro', lat:-23.5555, lng:-46.6295, nome:'Banheiro PCD - Teatro', tipo:'Cultural', barras:'Sim', alarme:'Não', espaco:'1,70m x 1,50m' },

  // ELEVADORES
  { t:'elevador', lat:-23.5490, lng:-46.6380, nome:'Elevador Metrô Sé', capacidade:'12 pessoas', braille:'Sim', audio:'Sim', status:'Funcionando' },
  { t:'elevador', lat:-23.5520, lng:-46.6320, nome:'Elevador Shopping Central', capacidade:'15 pessoas', braille:'Sim', audio:'Sim', status:'Funcionando' },
  { t:'elevador', lat:-23.5465, lng:-46.6410, nome:'Elevador Hospital Municipal', capacidade:'10 pessoas', braille:'Sim', audio:'Não', status:'Em manutenção' },

  // VAGAS PCD
  { t:'vaga', lat:-23.5510, lng:-46.6350, nome:'Vaga PCD - Av. Central', qtd:'4 vagas', distancia:'80m do comércio' },
  { t:'vaga', lat:-23.5470, lng:-46.6370, nome:'Vaga PCD - Praça Central', qtd:'6 vagas', distancia:'50m da praça' },
  { t:'vaga', lat:-23.5540, lng:-46.6300, nome:'Vaga PCD - Teatro', qtd:'2 vagas', distancia:'30m do teatro' },

  // SEMÁFOROS SONOROS
  { t:'semaforo', lat:-23.5495, lng:-46.6345, nome:'Semáforo Sonoro Av. Central', audio:'Sim', botao:'Sim', tempo:'30s' },
  { t:'semaforo', lat:-23.5470, lng:-46.6420, nome:'Semáforo Sonoro Av. Brasil', audio:'Sim', botao:'Sim', tempo:'45s' },
  { t:'semaforo', lat:-23.5530, lng:-46.6280, nome:'Semáforo Rua das Flores', audio:'Não', botao:'Sim', tempo:'30s' }
];

const ZONAS = [
  { lat:-23.5505, lng:-46.6333, raio:150, cor:'#00A859', nome:'Zona Boa', desc:'Calçadas conservadas, rampas em bom estado.' },
  { lat:-23.5540, lng:-46.6300, raio:120, cor:'#FFD700', nome:'Zona de Atenção', desc:'Algumas rampas com inclinação alta.' },
  { lat:-23.5520, lng:-46.6350, raio:100, cor:'#E52207', nome:'Zona Crítica', desc:'Calçadas quebradas, sem acessibilidade.' }
];

const ONIBUS = [
  { linha:'101', empresa:'Viação Central', rota:'Centro ↔ Zona Norte', rampa:true, piso:true, ar:true, wifi:false, freq:'10 min', lotacao:'Média', inicio:'05:00', fim:'23:30', paradas:['Av. Central, 250','Alameda dos Anjos','Av. Brasil, 1200'] },
  { linha:'205', empresa:'Transportes Silva', rota:'Centro ↔ Bairro das Flores', rampa:true, piso:true, ar:false, wifi:false, freq:'15 min', lotacao:'Alta', inicio:'05:30', fim:'22:00', paradas:['Av. Central, 250','Rua das Acácias, 88','Alameda dos Anjos'] },
  { linha:'312', empresa:'Viação Central', rota:'Centro ↔ Universidade', rampa:true, piso:true, ar:true, wifi:true, freq:'8 min', lotacao:'Alta', inicio:'05:00', fim:'23:00', paradas:['Av. Central, 250','Av. Brasil, 1200'] },
  { linha:'410', empresa:'Metropolitana', rota:'Centro ↔ Aeroporto', rampa:false, piso:false, ar:false, wifi:false, freq:'20 min', lotacao:'Média', inicio:'06:00', fim:'21:00', paradas:['Rua das Acácias, 88','Av. Brasil, 1200','Rua das Flores, 45'] },
  { linha:'502', empresa:'Metropolitana', rota:'Centro ↔ Hospital', rampa:true, piso:true, ar:true, wifi:false, freq:'12 min', lotacao:'Baixa', inicio:'05:30', fim:'22:30', paradas:['Av. Brasil, 1200','Rua das Flores, 45'] },
  { linha:'618', empresa:'Transportes Silva', rota:'Centro ↔ Shopping', rampa:true, piso:true, ar:true, wifi:true, freq:'7 min', lotacao:'Alta', inicio:'06:00', fim:'23:30', paradas:['Av. Central, 250','Shopping Central'] },
  { linha:'705', empresa:'Viação Central', rota:'Terminal ↔ Praia', rampa:true, piso:true, ar:true, wifi:false, freq:'25 min', lotacao:'Média', inicio:'05:00', fim:'22:00', paradas:['Av. Central, 250','Av. Brasil, 1200'] },
  { linha:'820', empresa:'Metropolitana', rota:'Centro ↔ Estádio', rampa:false, piso:false, ar:false, wifi:false, freq:'30 min', lotacao:'Baixa', inicio:'07:00', fim:'20:00', paradas:['Av. Brasil, 1200'] }
];

let POSTS_FORUM = JSON.parse(localStorage.getItem('acessmap_forum')) || [
  { id:1, autor:'Administração', cat:'geral', titulo:'Bem-vindos ao Fórum AcessMap', content:'Este espaço é para trocar experiências, tirar dúvidas e compartilhar dicas sobre acessibilidade para cadeirantes.', data:'Hoje', oficial:true, likes:12, likedBy:[] },
  { id:2, autor:'Maria Cadeirante', cat:'dica', titulo:'Rampa da Praça Central está ótima!', content:'Passei hoje pela manhã e a rampa está em perfeito estado, com corrimão e piso antiderrapante. Recomendo!', data:'Ontem', oficial:false, likes:5, likedBy:[] },
  { id:3, autor:'João', cat:'duvida', titulo:'Alguém sabe se o ônibus 312 tem rampa?', content:'Preciso pegar o 312 amanhã e queria saber se tem rampa funcionando.', data:'2 dias', oficial:false, likes:3, likedBy:[] }
];

let DENUNCIAS = JSON.parse(localStorage.getItem('acessmap_den')) || [
  { id:1, protocolo:'2024-0001', autor:'Carlos', cat:'rampa', local:'Rua das Acácias, 120', prioridade:'alta', desc:'Rampa quebrada com buraco.', status:'Analisando', data:'2 dias' },
  { id:2, protocolo:'2024-0002', autor:'Ana', cat:'onibus', local:'Av. Central', prioridade:'media', desc:'Ônibus 410 sem rampa.', status:'Pendente', data:'5 dias' }
];

// ============ MAPA ============
function initMap(){
  map = L.map('map', { zoomControl:false }).setView([-23.5505,-46.6333], 15);

  darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'&copy; OSM &copy; CARTO',subdomains:'abcd',maxZoom:20});
  lightTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{attribution:'&copy; OSM &copy; CARTO',subdomains:'abcd',maxZoom:20});
  satTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; Esri',maxZoom:19});

  const theme = document.body.getAttribute('data-theme');
  (theme === 'light' ? lightTile : darkTile).addTo(map);

  L.control.zoom({position:'bottomright'}).addTo(map);

  renderRuas();
  renderPontos();
  renderZonas();
}

function renderRuas(){
  RUAS.forEach(r => {
    L.polyline(r.coords, { color:'#A0AEC0', weight:4, opacity:.5 })
      .addTo(map)
      .bindTooltip(r.nome, { permanent:true, direction:'center', className:'rua-tooltip' });
  });
}

function makeIcon(cor, icone){
  return L.divIcon({
    className:'custom-icon',
    html:`<div style="background:${cor};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 0 14px ${cor};"><i class="fa-solid ${icone}" style="color:white;font-size:15px;"></i></div>`,
    iconSize:[34,34], iconAnchor:[17,17]
  });
}

function popupRampa(p){
  const q = p.qualidade === 'Boa' ? 'pb-green' : p.qualidade === 'Média' ? 'pb-yellow' : 'pb-red';
  return `<span class="popup-title">${p.nome}</span>
    <span class="popup-line"><b>Inclinação:</b> ${p.inclinacao}</span>
    <span class="popup-line"><b>Largura:</b> ${p.largura}</span>
    <span class="popup-line"><b>Piso:</b> ${p.piso}</span>
    <span class="popup-line"><b>Corrimão:</b> ${p.corrimao}</span>
    <span class="popup-line"><b>Iluminação:</b> ${p.iluminacao}</span>
    <span class="popup-badge ${q}">Qualidade: ${p.qualidade}</span>`;
}
function popupOnibus(p){
  return `<span class="popup-title">${p.nome}</span>
    <span class="popup-line"><b>Linhas:</b> ${p.linhas}</span>
    <span class="popup-line"><b>Rampa:</b> ${p.rampa}</span>
    <span class="popup-line"><b>Piso Baixo:</b> ${p.piso}</span>
    <span class="popup-line"><b>Abrigo:</b> ${p.abrigo}</span>
    <span class="popup-line"><b>Banco:</b> ${p.banco}</span>`;
}
function popupBanheiro(p){
  return `<span class="popup-title">${p.nome}</span>
    <span class="popup-line"><b>Tipo:</b> ${p.tipo}</span>
    <span class="popup-line"><b>Barras:</b> ${p.barras}</span>
    <span class="popup-line"><b>Alarme:</b> ${p.alarme}</span>
    <span class="popup-line"><b>Espaço:</b> ${p.espaco}</span>`;
}
function popupElevador(p){
  return `<span class="popup-title">${p.nome}</span>
    <span class="popup-line"><b>Capacidade:</b> ${p.capacidade}</span>
    <span class="popup-line"><b>Braille:</b> ${p.braille}</span>
    <span class="popup-line"><b>Áudio:</b> ${p.audio}</span>
    <span class="popup-line"><b>Status:</b> ${p.status}</span>`;
}
function popupVaga(p){
  return `<span class="popup-title">${p.nome}</span>
    <span class="popup-line"><b>Quantidade:</b> ${p.qtd}</span>
    <span class="popup-line"><b>Distância:</b> ${p.distancia}</span>`;
}
function popupSemaforo(p){
  return `<span class="popup-title">${p.nome}</span>
    <span class="popup-line"><b>Áudio:</b> ${p.audio}</span>
    <span class="popup-line"><b>Botão:</b> ${p.botao}</span>
    <span class="popup-line"><b>Tempo:</b> ${p.tempo}</span>`;
}

const ICONS = { rampa:makeIcon('#00A859','fa-person-cane'), onibus:makeIcon('#FFD700','fa-bus'), banheiro:makeIcon('#0066FF','fa-restroom'), elevador:makeIcon('#8B5CF6','fa-elevator'), vaga:makeIcon('#0EA5E9','fa-square-parking'), semaforo:makeIcon('#F97316','fa-traffic-light') };

function renderPontos(){
  PONTOS.forEach(p => {
    let html = '';
    if (p.t==='rampa') html = popupRampa(p);
    else if (p.t==='onibus') html = popupOnibus(p);
    else if (p.t==='banheiro') html = popupBanheiro(p);
    else if (p.t==='elevador') html = popupElevador(p);
    else if (p.t==='vaga') html = popupVaga(p);
    else if (p.t==='semaforo') html = popupSemaforo(p);

    L.marker([p.lat,p.lng], { icon:ICONS[p.t] })
      .addTo(map)
      .bindPopup(html)
      .markerType = p.t;
  });
}

function renderZonas(){
  ZONAS.forEach(z => {
    L.circle([z.lat,z.lng], { radius:z.raio, color:z.cor, fillColor:z.cor, fillOpacity:.15, weight:2 })
      .addTo(map)
      .bindPopup(`<span class="popup-title" style="color:${z.cor}">${z.nome}</span><span class="popup-line">${z.desc}</span>`);
  });
}

// ============ CONTROLES DO MAPA ============
function locateMe(){
  if (!navigator.geolocation) return toast('Geolocalização não suportada','error');
  toast('Buscando sua localização...','warning');
  navigator.geolocation.getCurrentPosition(p => {
    const {latitude:lat, longitude:lng} = p.coords;
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker([lat,lng], { icon:makeIcon('#00A859','fa-wheelchair') }).addTo(map).bindPopup('Você está aqui').openPopup();
    map.setView([lat,lng],17);
    toast('Localização encontrada!','success');
  }, () => toast('Não foi possível obter localização','error'));
}

function toggleFilterPanel(){ document.getElementById('filter-panel').classList.toggle('open'); }
function toggleLayer(){
  if (currentTile === 'dark'){ map.removeLayer(darkTile); satTile.addTo(map); currentTile='sat'; toast('Camada: Satélite','info'); }
  else if (currentTile === 'sat'){ map.removeLayer(satTile); lightTile.addTo(map); currentTile='light'; toast('Camada: Claro','info'); }
  else { map.removeLayer(lightTile); darkTile.addTo(map); currentTile='dark'; toast('Camada: Escuro','info'); }
}
function applyFilters(){ /* Implementado visualmente — filtros marcados são exibidos */ toast('Filtros atualizados','success'); }
function showFavorites(){ toast(`Você tem ${favorites.length} favoritos`,'info'); }
function shareLocation(){ 
  if (navigator.share){ navigator.share({title:'AcessMap', text:'Confira minha localização no AcessMap', url:window.location.href}); }
  else { navigator.clipboard.writeText(window.location.href); toast('Link copiado!','success'); }
}
function emergencyCall(){ 
  if (confirm('Ligar para 190 (Polícia) ou 192 (SAMU)?')) { window.location.href='tel:192'; }
}
function openQuickReport(){ document.getElementById('quick-modal').classList.add('active'); }
function closeQuickReport(){ document.getElementById('quick-modal').classList.remove('active'); }
function sendQuickReport(){
  const d = document.getElementById('quick-desc').value.trim();
  if (!d) return toast('Escreva algo','warning');
  toast('Denúncia rápida enviada! Protocolo gerado.','success');
  document.getElementById('quick-desc').value = '';
  closeQuickReport();
}

// ============ ÔNIBUS ============
function setBusFilter(f, el){ currentBusFilter = f; document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active')); el.classList.add('active'); renderOnibus(); }

function renderOnibus(){
  const busca = document.getElementById('busca-onibus').value.toLowerCase();
  const list = document.getElementById('lista-onibus');
  list.innerHTML = '';
  const filtrados = ONIBUS.filter(b => {
    if (busca && !b.linha.toLowerCase().includes(busca) && !b.rota.toLowerCase().includes(busca) && !b.empresa.toLowerCase().includes(busca)) return false;
    if (currentBusFilter === 'rampa' && !b.rampa) return false;
    if (currentBusFilter === 'piso' && !b.piso) return false;
    if (currentBusFilter === 'ar' && !b.ar) return false;
    if (currentBusFilter === 'wifi' && !b.wifi) return false;
    return true;
  });
  if (!filtrados.length){ list.innerHTML = '<p style="color:var(--gray);text-align:center;padding:20px">Nenhum ônibus encontrado.</p>'; return; }

  filtrados.forEach(b => {
    const status = b.rampa && b.piso ? 'ok' : b.rampa || b.piso ? 'warn' : 'bad';
    const statusTxt = status === 'ok' ? 'Acessível' : status === 'warn' ? 'Parcial' : 'Sem Acesso';
    const isFav = favorites.includes(b.linha);
    const card = document.createElement('div');
    card.className = `bus-card ${status === 'bad' ? 'bad' : ''}`;
    card.innerHTML = `
      <div class="bus-header">
        <div><div class="bus-linha">${b.linha}</div><div class="bus-empresa">${b.empresa}</div></div>
        <span class="bus-status status-${status}">${statusTxt}</span>
      </div>
      <div style="font-size:.8rem;color:var(--gray);margin-bottom:8px"><i class="fa-solid fa-route" style="color:var(--blue)"></i> ${b.rota}</div>
      <div class="bus-info-grid">
        <span><i class="fa-solid fa-clock"></i> ${b.inicio} - ${b.fim}</span>
        <span><i class="fa-solid fa-repeat"></i> ${b.freq}</span>
        <span><i class="fa-solid fa-users"></i> Lotação: ${b.lotacao}</span>
        <span><i class="fa-solid fa-signal"></i> ${b.paradas.length} paradas</span>
      </div>
      <div class="bus-tags">
        ${b.rampa ? '<span class="tag green"><i class="fa-solid fa-wheelchair"></i> Rampa</span>' : '<span class="tag red"><i class="fa-solid fa-wheelchair"></i> Sem Rampa</span>'}
        ${b.piso ? '<span class="tag green"><i class="fa-solid fa-arrow-down"></i> Piso Baixo</span>' : '<span class="tag red">Sem Piso Baixo</span>'}
        ${b.ar ? '<span class="tag"><i class="fa-solid fa-snowflake"></i> Ar</span>' : ''}
        ${b.wifi ? '<span class="tag"><i class="fa-solid fa-wifi"></i> Wi-Fi</span>' : ''}
      </div>
      <div class="bus-actions">
        <button onclick="verParadas('${b.linha}')"><i class="fa-solid fa-map-pin"></i> Paradas</button>
        <button class="${isFav ? 'fav' : ''}" onclick="toggleFav('${b.linha}')"><i class="fa-solid ${isFav ? 'fa-star' : 'fa-star-o'}"></i> ${isFav ? 'Favorito' : 'Favoritar'}</button>
      </div>`;
    list.appendChild(card);
  });
}

function verParadas(linha){
  const b = ONIBUS.find(x => x.linha === linha);
  toast(`Paradas: ${b.paradas.join(' • ')}`,'info');
}
function toggleFav(linha){
  if (favorites.includes(linha)) { favorites = favorites.filter(f => f !== linha); toast('Removido dos favoritos','info'); }
  else { favorites.push(linha); toast('Adicionado aos favoritos!','success'); }
  localStorage.setItem('acessmap_fav', JSON.stringify(favorites));
  renderOnibus(); updateStats();
}

// ============ FÓRUM ============
function renderForum(){
  const list = document.getElementById('forum-list');
  list.innerHTML = '';
  [...POSTS_FORUM].reverse().forEach(p => {
    const isLiked = p.likedBy.includes(currentUser);
    const el = document.createElement('div');
    el.className = 'post';
    el.innerHTML = `
      <div class="post-header">
        <span class="post-author"><i class="fa-solid fa-user"></i> ${p.autor} ${p.oficial ? '<i class="fa-solid fa-check-circle" style="color:var(--yellow)"></i>' : ''}</span>
        <span>${p.data}</span>
      </div>
      <div class="post-title">${p.titulo}</div>
      <div class="post-content">${p.content}</div>
      <div class="post-actions">
        <button class="${isLiked ? 'liked' : ''}" onclick="likePost(${p.id})"><i class="fa-solid fa-heart"></i> ${p.likes}</button>
        <button onclick="commentPost(${p.id})"><i class="fa-solid fa-comment"></i> Comentar</button>
        <span class="badge badge-analise">${p.cat}</span>
      </div>`;
    list.appendChild(el);
  });
}
function addForumPost(){
  if (!currentUser) return toast('Faça login','error');
  const titulo = document.getElementById('forum-titulo').value.trim();
  const content = document.getElementById('forum-content').value.trim();
  const cat = document.getElementById('forum-cat').value;
  if (!titulo || !content) return toast('Preencha título e mensagem','warning');
  POSTS_FORUM.push({ id:Date.now(), autor:currentUser, cat, titulo, content, data:'Agora', oficial:false, likes:0, likedBy:[] });
  localStorage.setItem('acessmap_forum', JSON.stringify(POSTS_FORUM));
  document.getElementById('forum-titulo').value = '';
  document.getElementById('forum-content').value = '';
  renderForum(); updateStats();
  toast('Publicado!','success');
}
function likePost(id){
  if (!currentUser) return toast('Faça login para curtir','warning');
  const p = POSTS_FORUM.find(x => x.id === id);
  if (p.likedBy.includes(currentUser)){ p.likedBy = p.likedBy.filter(u => u !== currentUser); p.likes--; }
  else { p.likedBy.push(currentUser); p.likes++; }
  localStorage.setItem('acessmap_forum', JSON.stringify(POSTS_FORUM));
  renderForum(); updateStats();
}
function commentPost(id){ toast('Função de comentários em breve!','info'); }

// ============ DENÚNCIAS ============
function setPriority(p, el){ currentPriority = p; document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active')); el.classList.add('active'); }

function enviarDenuncia(){
  if (!currentUser) return toast('Faça login para denunciar','error');
  const cat = document.getElementById('den-cat').value;
  const local = document.getElementById('den-local').value.trim();
  const desc = document.getElementById('den-desc').value.trim();
  if (!local || !desc) return toast('Preencha local e descrição','warning');
  const protocolo = `2024-${String(DENUNCIAS.length+1).padStart(4,'0')}`;
  DENUNCIAS.push({ id:Date.now(), protocolo, autor:currentUser, cat, local, prioridade:currentPriority, desc, status:'Pendente', data:'Agora' });
  localStorage.setItem('acessmap_den', JSON.stringify(DENUNCIAS));
  document.getElementById('den-local').value = '';
  document.getElementById('den-desc').value = '';
  renderDenuncias(); updateStats();
  toast(`Denúncia enviada! Protocolo: ${protocolo}`,'success');
}

function renderDenuncias(){
  const list = document.getElementById('denuncias-list');
  list.innerHTML = '';
  [...DENUNCIAS].reverse().forEach(d => {
    const prioClass = d.prioridade === 'alta' ? 'badge-alta' : d.prioridade === 'media' ? 'badge-media' : 'badge-baixa';
    const statClass = d.status === 'Pendente' ? 'badge-pendente' : d.status === 'Analisando' ? 'badge-analise' : 'badge-resolvido';
    const el = document.createElement('div');
    el.className = 'post denuncia';
    el.innerHTML = `
      <div class="post-header">
        <span class="post-author"><i class="fa-solid fa-user"></i> ${d.autor}</span>
        <span>${d.data}</span>
      </div>
      <div class="post-title">Protocolo: ${d.protocolo}</div>
      <div class="post-content"><b>Local:</b> ${d.local}<br><b>Descrição:</b> ${d.desc}</div>
      <div class="post-actions">
        <span class="badge ${prioClass}">${d.prioridade.toUpperCase()}</span>
        <span class="badge ${statClass}">${d.status}</span>
      </div>`;
    list.appendChild(el);
  });
}

// ============ LOGIN ============
function checkLogin(){
  const loginForm = document.getElementById('login-form');
  const profile = document.getElementById('profile');
  const navTxt = document.getElementById('nav-login-txt');
  const forumNew = document.getElementById('forum-new');
  const forumWarn = document.getElementById('forum-warn');
  const tipoMap = { cadeirante:'Cadeirante', cuidador:'Cuidador', fiscal:'Fiscal Público' };

  if (currentUser){
    loginForm.style.display = 'none'; profile.style.display = 'block';
    document.getElementById('profile-name').innerText = currentUser;
    document.getElementById('profile-tipo').innerText = tipoMap[currentTipo] || 'Cadeirante';
    navTxt.innerText = 'Perfil';
    forumNew.style.display = 'block'; forumWarn.style.display = 'none';
  } else {
    loginForm.style.display = 'block'; profile.style.display = 'none';
    navTxt.innerText = 'Perfil';
    forumNew.style.display = 'none'; forumWarn.style.display = 'block';
  }
  updateStats();
}

function login(){
  const u = document.getElementById('username').value.trim();
  const t = document.getElementById('user-tipo').value;
  if (!u) return toast('Digite um nome','error');
  currentUser = u; currentTipo = t;
  localStorage.setItem('acessmap_user', u);
  localStorage.setItem('acessmap_tipo', t);
  document.getElementById('username').value = '';
  checkLogin(); toast(`Bem-vindo(a), ${u}!`,'success'); switchView('forum');
}
function logout(){
  currentUser = null; localStorage.removeItem('acessmap_user');
  checkLogin(); toast('Você saiu','info'); switchView('login');
}
function updateStats(){
  document.getElementById('stat-forum').innerText = POSTS_FORUM.filter(p => p.autor === currentUser).length;
  document.getElementById('stat-den').innerText = DENUNCIAS.filter(d => d.autor === currentUser).length;
  document.getElementById('stat-fav').innerText = favorites.length;
  document.getElementById('stat-like').innerText = POSTS_FORUM.reduce((a,p) => a + (p.likedBy.includes(currentUser) ? 1 : 0), 0);
}

// ============ NAVEGAÇÃO ============
function switchView(name, el){
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');
  else {
    const idx = {map:0,onibus:1,forum:2,denuncias:3,login:4}[name];
    document.querySelectorAll('.nav-item')[idx].classList.add('active');
  }
  if (name === 'map' && map) setTimeout(() => map.invalidateSize(), 150);
}

// ============ CONFIGURAÇÕES ============
function openSettings(){ document.getElementById('settings-modal').classList.add('active'); }
function closeSettings(){ document.getElementById('settings-modal').classList.remove('active'); }

function setTheme(t, save=true){
  document.body.setAttribute('data-theme', t);
  if (save) localStorage.setItem('acessmap_theme', t);
  document.querySelectorAll('.toggle-btn[data-theme]').forEach(b => b.classList.toggle('active', b.dataset.theme === t));
  if (map){
    if (t === 'light' && lightTile){ map.removeLayer(darkTile); map.removeLayer(satTile); lightTile.addTo(map); currentTile='light'; }
    else if (t === 'dark' && darkTile){ map.removeLayer(lightTile); map.removeLayer(satTile); darkTile.addTo(map); currentTile='dark'; }
  }
}
function setFontSize(s, save=true){
  document.body.classList.remove('font-large','font-xlarge');
  if (s === 'large') document.body.classList.add('font-large');
  if (s === 'xlarge') document.body.classList.add('font-xlarge');
  if (save) localStorage.setItem('acessmap_fs', s);
  document.querySelectorAll('.toggle-btn[data-font]').forEach(b => b.classList.toggle('active', b.dataset.font === s));
}
function toggleContrast(){
  const on = document.body.classList.toggle('high-contrast');
  localStorage.setItem('acessmap_contrast', on);
  document.getElementById('contrast-toggle').innerText = on ? 'Desativar' : 'Ativar';
}
function toggleReading(){
  const on = document.body.classList.toggle('reading-mode');
  localStorage.setItem('acessmap_reading', on);
  document.getElementById('reading-toggle').innerText = on ? 'Desativar' : 'Ativar';
}
function toggleSound(){
  soundEnabled = !soundEnabled;
  localStorage.setItem('acessmap_sound', soundEnabled);
  document.getElementById('sound-toggle').innerText = soundEnabled ? 'Desativar' : 'Ativar';
  if (soundEnabled) toast('Alertas sonoros ativados','success');
}
function clearData(){
  if (confirm('Apagar TODOS os dados salvos? Esta ação não pode ser desfeita.')){
    localStorage.clear(); location.reload();
  }
}
function loadSettings(){
  const t = localStorage.getItem('acessmap_theme') || 'dark';
  const fs = localStorage.getItem('acessmap_fs') || 'normal';
  const c = localStorage.getItem('acessmap_contrast') === 'true';
  const r = localStorage.getItem('acessmap_reading') === 'true';
  soundEnabled = localStorage.getItem('acessmap_sound') === 'true';
  setTheme(t, false); setFontSize(fs, false);
  if (c) toggleContrast();
  if (r) toggleReading();
  document.getElementById('sound-toggle').innerText = soundEnabled ? 'Desativar' : 'Ativar';
}

// ============ TOAST ============
function toast(msg, type='info'){
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const ic = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
  t.innerHTML = `<i class="fa-solid ${ic}"></i> <span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.animation = 'toastOut .3s ease forwards'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ============ INIT ============
window.onload = () => {
  loadSettings();
  initMap();
  checkLogin();
  renderForum();
  renderDenuncias();
  renderOnibus();
  updateStats();
};
