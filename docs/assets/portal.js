const demo = document.querySelector('[data-mode-demo]');
document.querySelectorAll('[data-mode-button]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-mode-button]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
    button.setAttribute('aria-pressed', 'true');
    demo.dataset.mode = button.dataset.modeButton;
    demo.querySelector('[data-mode-name]').textContent = button.textContent;
  });
});

const search = document.querySelector('[data-search-input]');
search?.addEventListener('input', () => {
  const query = search.value.trim().toLowerCase();
  document.querySelectorAll('[data-search]').forEach((item) => {
    item.classList.toggle('hidden-by-search', query && !item.textContent.toLowerCase().includes(query));
  });
});

