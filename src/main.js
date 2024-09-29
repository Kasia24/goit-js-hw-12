import axios from 'axios';

const API_KEY = '46058905-76d6ace161caaf887286baf22';
const BASE_URL = 'https://pixabay.com/api/';

async function fetchImages(query, page = 1) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        per_page: 40,
        page: page,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw error;
  }
}
let currentQuery = '';
let currentPage = 1;

// Ukryj przycisk na początku
loadMoreBtn.style.display = 'none';

form.addEventListener('submit', async event => {
  event.preventDefault();

  // Pobierz wartość wyszukiwaną przez użytkownika
  const query = event.target.querySelector('input[name="search"]').value.trim();

  // Zresetuj paginację i galerię, jeśli nowe słowo kluczowe
  if (query !== currentQuery) {
    currentQuery = query;
    currentPage = 1;
    gallery.innerHTML = ''; // Wyczyszczenie galerii dla nowego wyszukiwania
    loadMoreBtn.style.display = 'none';
  }

  // Pobierz obrazy
  const images = await fetchImages(currentQuery, currentPage);

  // Dodaj obrazy do galerii
  displayImages(images.hits);

  // Jeśli są kolejne strony, pokaż przycisk "Load more"
  if (images.totalHits > currentPage * 40) {
    loadMoreBtn.style.display = 'block';
  }
});

loadMoreBtn.addEventListener('click', async () => {
  // Zwiększ numer strony i pobierz kolejną porcję obrazów
  currentPage += 1;

  const images = await fetchImages(currentQuery, currentPage);
  displayImages(images.hits);

  // Ukryj przycisk, jeśli nie ma więcej wyników
  if (currentPage * 40 >= images.totalHits) {
    loadMoreBtn.style.display = 'none';
  }
});
function displayImages(images) {
  const markup = images
    .map(
      image => `
      <div class="image-item">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy"/>
      </div>
    `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

const loader = document.querySelector('.loader');

async function loadImages() {
  loader.style.display = 'block'; // Pokaż loader
  loadMoreBtn.style.display = 'none'; // Ukryj przycisk podczas ładowania

  const images = await fetchImages(currentQuery, currentPage);
  displayImages(images.hits);

  loader.style.display = 'none'; // Ukryj loader po załadowaniu
  if (currentPage * 40 < images.totalHits) {
    loadMoreBtn.style.display = 'block'; // Pokaż przycisk, jeśli są więcej obrazy
  }
}

const form = document.querySelector('form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const endMessage = document.querySelector('.end-message');
const loader = document.querySelector('.loader');

// Ukryj przycisk i komunikat na początku
loadMoreBtn.style.display = 'none';
endMessage.style.display = 'none';
