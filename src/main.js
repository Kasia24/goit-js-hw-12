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

// Elementy DOM
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const gallery = document.getElementById('gallery');
const loader = document.getElementById('loader');

// Inicjalizacja SimpleLightbox
let lightbox = new SimpleLightbox('.gallery a');

// Funkcja pokazująca i ukrywająca loader
function showLoader() {
  loader.style.display = 'block';
}

function hideLoader() {
  loader.style.display = 'none';
}

// Pokaż loader
loader.hidden = true;

try {
  showLoader();
  const response = await fetch(url);
  const data = await response.json();

  hideLoader();

  // Czyszczenie galerii przed dodaniem nowych wyników
  clearGallery();

  // Ukryj loader
  loader.hidden = false;

  if (data.hits.length === 0) {
    // Wyświetlanie komunikatu iziToast
    iziToast.error({
      title: 'Error',
      message:
        'Sorry, there are no images matching your search query. Please try again!',
    });
  } else {
    // Wyświetlanie obrazów
    displayImages(data.hits);
    // Odświeżenie lightboxa po dodaniu nowych elementów
    lightbox.refresh();
  }
} catch (error) {
  // Ukryj loader w przypadku błędu
  loader.hidden = true;
  console.error('Error fetching images from Pixabay:', error);
}

// Funkcja do wyświetlania obrazów w galerii
const displayImages = images => {
  images.forEach(image => {
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
            <a href="${image.largeImageURL}">
                <img src="${image.webformatURL}" alt="${image.tags}">
            </a>
            <div class="stats">
                <span class="span">Likes
                ${image.likes}</span>
                <span class="span">Views 
                ${image.views}</span>
                <span class="span">Comments 
                ${image.comments}</span>
                <span class="span">Downloads 
                ${image.downloads}</span>
            </div>
        `;

    gallery.appendChild(card);
  });
};

// Funkcja do czyszczenia galerii
const clearGallery = () => {
  gallery.innerHTML = '';
};

// Obsługa formularza wyszukiwania
searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query !== '') {
    searchImages(query);
  }
});
