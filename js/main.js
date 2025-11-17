document.getElementById('y').textContent = new Date().getFullYear();

const recommendationsGrid = document.getElementById('recommendationsGrid');
const paginationInfos = document.querySelectorAll('[data-pagination-info]');
const paginationGroups = document.querySelectorAll('[data-pagination-group]');
const prevButtons = document.querySelectorAll('[data-page="prev"]');
const nextButtons = document.querySelectorAll('[data-page="next"]');
const search = document.getElementById('searchInput');

const recommendationsState = {
  cards: [],
  filtered: [],
  ads: [],
  page: 1,
  perPage: 9
};

const animateCard = (card, delay = 0) => {
  if (typeof anime === 'undefined' || !card) return;
  anime({
    targets: card,
    translateY: [
      { value: -2, duration: 1600, easing: 'easeInOutSine' },
      { value: 0, duration: 1600, easing: 'easeInOutSine' }
    ],
    delay,
    loop: true
  });

  card.addEventListener('mouseenter', () => {
    anime({ targets: card, scale: 1.02, duration: 300, easing: 'easeOutQuad' });
  });
  card.addEventListener('mouseleave', () => {
    anime({ targets: card, scale: 1, duration: 300, easing: 'easeOutQuad' });
  });
};

const getStars = rating => {
  const rounded = Math.min(5, Math.max(0, Math.round(rating)));
  const filled = '&#9733;';
  const empty = '&#9734;';
  let stars = '';
  for (let i = 0; i < 5; i += 1) {
    stars += i < rounded ? filled : empty;
  }
  return stars;
};

const getRandomAd = ads => {
  if (!ads || !ads.length) return null;
  const randomIndex = Math.floor(Math.random() * ads.length);
  return ads[randomIndex];
};

const renderRecommendations = (cards = [], ads = []) => {
  if (!recommendationsGrid) return;
  recommendationsGrid.innerHTML = '';

  if (!cards.length) {
    recommendationsGrid.innerHTML = '<p class="text-secondary small mb-0">No hay videos disponibles por ahora.</p>';
    return;
  }

  cards.forEach((card, idx) => {
    const adSlot = getRandomAd(ads);
    const rating = (Math.random() * 2 + 3).toFixed(1);
    const el = document.createElement('article');
    el.className = 'card-neon item';
    el.dataset.title = card.titulo || '';
    el.dataset.desc = card.descripcion || '';
    el.innerHTML = `
      <div class="media">
        <img src="${card.imagen}" alt="${card.titulo || 'Video recomendado'}">
      </div>
      <div class="body">
        <h3 class="card-title blurred">${card.titulo || 'Video sin titulo'}</h3>
        <p>${card.descripcion || 'Nueva historia exclusiva para la comunidad.'}</p>
        <div class="card-rating" aria-label="Calificacion ${rating} de 5">
          <span class="stars">${getStars(rating)}</span>
          <small>${rating}</small>
        </div>
        <div class="card-actions">
          <button type="button" class="btn btn-ad w-100">
            Desbloquea con publicidad
          </button>
          <a class="btn btn-video w-100 disabled" href="${card.link || '#'}" target="_blank" rel="noopener noreferrer" aria-disabled="true">
            Ver video
          </a>
        </div>
      </div>
    `;

    const adBtn = el.querySelector('.btn-ad');
    const videoBtn = el.querySelector('.btn-video');
    const titleEl = el.querySelector('.card-title');
    let unlocked = false;

    adBtn.addEventListener('click', () => {
      if (adSlot && adSlot.url) {
        window.open(adSlot.url, '_blank', 'noopener,noreferrer');
      }
      unlocked = true;
      videoBtn.classList.remove('disabled');
      videoBtn.removeAttribute('aria-disabled');
      if (titleEl) {
        titleEl.classList.remove('blurred');
      }
    });

    videoBtn.addEventListener('click', evt => {
      if (!unlocked) {
        evt.preventDefault();
      }
    });

    recommendationsGrid.appendChild(el);
    animateCard(el, idx * 120);
  });
};

const updatePaginationControls = totalPages => {
  if (!paginationInfos.length || !prevButtons.length || !nextButtons.length) return;
  paginationInfos.forEach(node => {
    node.textContent = `Pagina ${recommendationsState.page} de ${totalPages}`;
  });
  prevButtons.forEach(btn => {
    btn.disabled = recommendationsState.page <= 1;
  });
  nextButtons.forEach(btn => {
    btn.disabled = recommendationsState.page >= totalPages;
  });
  paginationGroups.forEach(group => {
    group.classList.toggle('d-none', totalPages <= 1);
  });
};

const renderPage = () => {
  if (!recommendationsGrid) return;
  const total = recommendationsState.filtered.length;
  const totalPages = total ? Math.ceil(total / recommendationsState.perPage) : 1;
  const safePage = Math.min(Math.max(recommendationsState.page, 1), totalPages);
  recommendationsState.page = safePage;
  const start = (safePage - 1) * recommendationsState.perPage;
  const subset = total ? recommendationsState.filtered.slice(start, start + recommendationsState.perPage) : [];
  renderRecommendations(subset, recommendationsState.ads);
  updatePaginationControls(totalPages);
};

const applySearchTerm = term => {
  const q = term.trim().toLowerCase();
  recommendationsState.filtered = recommendationsState.cards.filter(card => {
    const t = (card.titulo || '').toLowerCase();
    const d = (card.descripcion || '').toLowerCase();
    return !q || t.includes(q) || d.includes(q);
  });
  recommendationsState.page = 1;
  renderPage();
};

if (search) {
  search.addEventListener('input', e => applySearchTerm(e.target.value || ''));
}

prevButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (recommendationsState.page > 1) {
      recommendationsState.page -= 1;
      renderPage();
    }
  });
});

nextButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const totalPages = recommendationsState.filtered.length
      ? Math.ceil(recommendationsState.filtered.length / recommendationsState.perPage)
      : 1;
    if (recommendationsState.page < totalPages) {
      recommendationsState.page += 1;
      renderPage();
    }
  });
});

const loadRecommendations = async () => {
  if (!recommendationsGrid) return;
  try {
    const [cardsRes, adsRes] = await Promise.all([
      fetch('videos.json'),
      fetch('data/ads.json')
    ]);

    const cardsData = cardsRes.ok ? await cardsRes.json() : [];
    const adsData = adsRes.ok ? await adsRes.json() : [];
    recommendationsState.cards = cardsData;
    recommendationsState.ads = adsData;
    applySearchTerm(search ? search.value || '' : '');
  } catch (error) {
    console.error('Error cargando recomendaciones', error);
  }
};

loadRecommendations();
