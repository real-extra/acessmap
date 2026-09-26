// ==========================================
// 1. CONFIGURAÇÃO DO MAPA E DADOS
// ==========================================
let map;
let currentUser = localStorage.getItem('acessmap_user');
let userLocationMarker = null;

let posts = JSON.parse(localStorage.getItem('acessmap_posts')) || [
    { id: 1, author: 'Administração', content: 'Bem-vindo ao canal oficial de reclamações do AcessMap. Utilize este espaço para relatar problemas de infraestrutura urbana que afetem a acessibilidade.', date: 'Hoje', isOfficial: true },
    { id: 2, author: 'Carlos Silva', content: 'A rampa de acesso da estação central está com o corrimão solto. Perigoso para cadeirantes e idosos.', date: 'Ontem', isOfficial: false }
];

const accessiblePlaces = [
    { lat: -23.5505, lng: -46.6333, title: "Praça da Sé", desc: "Rampas de acesso e piso tátil." },
    { lat: -23.5489, lng: -46.6388, title: "Metrô Sé", desc: "Acesso elevador e piso tátil." },
    { lat: -23.5550, lng: -46.6300, title: "Teatro Municipal", desc: "Entrada acessível pela lateral." },
    { lat: -23.5450, lng: -46.6400, title: "Museu da Língua Portuguesa", desc: "Elevadores e banheiros adaptados." }
];

// Inicializa o Mapa
function initMap() {
    map = L.map('map', { zoomControl: false }).setView([-23.5505, -46.6333], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Ícone customizado baseado na logo (SVG)
    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
            <div style="position: relative; width: 40px; height: 50px;">
                <!-- Pino Azul -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0066FF" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.5)); width: 40px; height: 50px;">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <!-- Ícone da Cadeira de Rodas Branco -->
                <div style="position: absolute; top: 8px; left: 0; width: 100%; text-align: center; color: white; font-size: 14px;">
                    <i class="fa-solid fa-wheelchair"></i>
                </div>
            </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -45]
    });

    accessiblePlaces.forEach(place => {
        L.marker([place.lat, place.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${place.title}</b><br><span style="font-size:12px; color:#A0AEC0;">${place.desc}</span>`);
    });
}

// Botão de Localização
document.getElementById('locate-btn').addEventListener('click', () => {
    if (!navigator.geolocation) {
        showToast('Geolocalização não suportada.', 'error');
        return;
    }
    showToast('Buscando sua localização...', 'warning');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            if (userLocationMarker) map.removeLayer(userLocationMarker);

            userLocationMarker = L.marker([latitude, longitude], {
                icon: L.divIcon({
                    className: 'user-location',
                    html: `<div style='background-color: #00A859; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px #00A859;'></div>`,
                    iconSize: [20, 20], iconAnchor: [10, 10]
                })
            }).addTo(map).bindPopup('Você está aqui').openPopup();

            map.setView([latitude, longitude], 16);
            showToast('Localização encontrada!', 'success');
        },
        () => showToast('Não foi possível obter sua localização.', 'error')
    );
});


// ==========================================
// 2. NAVEGAÇÃO E INTERFACE
// ==========================================
function switchView(viewName, navElement = null) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (navElement) navElement.classList.add('active');
    else {
        const index = viewName === 'map' ? 0 : viewName === 'forum' ? 1 : 2;
        document.querySelectorAll('.nav-item')[index].classList.add('active');
    }

    if (viewName === 'map' && map) setTimeout(() => { map.invalidateSize(); }, 150);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// ==========================================
// 3. LOGIN
// ==========================================
function checkLoginState() {
    const loginForm = document.getElementById('login-form-container');
    const profileContainer = document.getElementById('profile-container');
    const navLoginText = document.getElementById('nav-login-text');
    const newPostArea = document.getElementById('new-post-area');
    const loginWarning = document.getElementById('login-warning');

    if (currentUser) {
        loginForm.style.display = 'none';
        profileContainer.style.display = 'block';
        document.getElementById('profile-name').innerText = currentUser;
        navLoginText.innerText = 'Perfil';
        newPostArea.style.display = 'block';
        loginWarning.style.display = 'none';
    } else {
        loginForm.style.display = 'block';
        profileContainer.style.display = 'none';
        navLoginText.innerText = 'Login';
        newPostArea.style.display = 'none';
        loginWarning.style.display = 'block';
    }
}

function login() {
    const usernameInput = document.getElementById('username').value.trim();
    if (usernameInput === '') return showToast('Digite um nome de usuário.', 'error');
    currentUser = usernameInput;
    localStorage.setItem('acessmap_user', currentUser);
    document.getElementById('username').value = '';
    checkLoginState();
    showToast(`Bem-vindo(a), ${currentUser}!`, 'success');
    switchView('forum');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('acessmap_user');
    checkLoginState();
    showToast('Você saiu da sua conta.', 'info');
    switchView('login');
}


// ==========================================
// 4. FÓRUM
// ==========================================
function renderPosts() {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';
    [...posts].reverse().forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        const authorColor = post.isOfficial ? 'var(--accent-yellow)' : 'var(--text-white)';
        const officialBadge = post.isOfficial ? '<i class="fa-solid fa-check-circle" style="color: var(--accent-yellow);"></i>' : '';
        postElement.innerHTML = `
            <div class="post-header">
                <span class="post-author" style="color: ${authorColor};"><i class="fa-solid fa-user"></i> ${post.author} ${officialBadge}</span>
                <span>${post.date}</span>
            </div>
            <div class="post-content">${post.content}</div>
        `;
        postsList.appendChild(postElement);
    });
}

function addPost() {
    if (!currentUser) return showToast('Você precisa estar logado.', 'error');
    const contentInput = document.getElementById('post-content');
    const content = contentInput.value.trim();
    if (content === '') return showToast('Escreva algo antes de publicar.', 'warning');

    posts.push({ id: Date.now(), author: currentUser, content: content, date: 'Agora mesmo', isOfficial: false });
    localStorage.setItem('acessmap_posts', JSON.stringify(posts));
    contentInput.value = '';
    renderPosts();
    showToast('Reclamação publicada!', 'success');
}

window.onload = () => {
    initMap();
    checkLoginState();
    renderPosts();
};
