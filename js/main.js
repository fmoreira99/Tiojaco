document.getElementById('y').textContent = new Date().getFullYear();

// Scroll botones
document.querySelectorAll('.rail-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.dataset.target);
    const step = Math.round(target.clientWidth * 0.8);
    target.scrollBy({ left: btn.classList.contains('left') ? -step : step, behavior: 'smooth' });
  });
});

// Filtro buscador
const search = document.getElementById('searchInput');
search.addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  document.querySelectorAll('.item').forEach(card => {
    const t = (card.dataset.title || '').toLowerCase();
    const d = (card.dataset.desc || '').toLowerCase();
    card.style.display = (t.includes(q) || d.includes(q)) ? 'inline-flex' : 'none';
  });
});

// Animación sutil con anime.js
const cards = document.querySelectorAll('.card-neon');
cards.forEach((card, i) => {
  anime({
    targets: card,
    translateY: [
      { value: -2, duration: 1600, easing: 'easeInOutSine' },
      { value: 0, duration: 1600, easing: 'easeInOutSine' }
    ],
    delay: i * 120,
    loop: true
  });

  card.addEventListener('mouseenter', () => {
    anime({ targets: card, scale: 1.02, duration: 300, easing: 'easeOutQuad' });
  });
  card.addEventListener('mouseleave', () => {
    anime({ targets: card, scale: 1, duration: 300, easing: 'easeOutQuad' });
  });
});

fetch('data/cards.json')
  .then(response => response.json())
  .then(cards => {
    const rail = document.querySelector('#rail1');
    rail.innerHTML = ''; // limpia por si acaso

    cards.forEach(card => {
      const el = document.createElement('a');
      el.className = 'card-neon item';
      el.href = card.link || '#';
      el.dataset.title = card.titulo;
      el.dataset.desc = card.descripcion;
      el.innerHTML = `
        <div class="media"><img src="${card.imagen}" alt="${card.titulo}"></div>
        <div class="body">
          <h3>${card.titulo}</h3>
          <p>${card.descripcion}</p>
          <span class="btn btn-sm btn-warning text-dark fw-semibold">${card.textoBoton}</span>
        </div>
      `;
      rail.appendChild(el);
    });

    // volver a aplicar animaciones si es necesario
  });
