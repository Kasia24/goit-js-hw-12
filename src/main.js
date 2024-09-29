import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

// Konfiguracja API Pixabay
const API_KEY = '46058905-76d6ace161caaf887286baf22';
const BASE_URL = 'https://pixabay.com/api/';
const perPage = 40; // Liczba obrazów na stronę
let currentPage = 1;
let currentQuery = '';
let totalHits = 0;

// Elementy DOM
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loader = document.querySelector('#loader');

// Funkcja do pobierania obrazów z Pixabay API
async function fetchImages(query, page) {
  try {
    // Wyświetl wskaźnik ładowania
    loader.classList.remove('loader-hidden');

    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
      },
    });

    totalHits = response.data.totalHits;

    if (response.data.hits.length === 0) {
      iziToast.error({
        title: 'Error',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
      return [];
    }

    return response.data.hits;
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
    });
    return [];
  } finally {
    // Ukryj wskaźnik ładowania po zakończeniu żądania
    loader.classList.add('loader-hidden');
  }
}

// Funkcja wyświetlająca obrazy w galerii
function displayImages(images) {
  const markup = images
    .map(image => {
      return `
      <div class="photo-card">
        <a href="${image.largeImageURL}">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p><b>Likes:</b> ${image.likes}</p>
          <p><b>Views:</b> ${image.views}</p>
          <p><b>Comments:</b> ${image.comments}</p>
          <p><b>Downloads:</b> ${image.downloads}</p>
        </div>
      </div>
    `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  refreshLightbox(); // Odświeżenie galerii SimpleLightbox po dodaniu obrazów
}

// Funkcja do czyszczenia galerii
function clearGallery() {
  gallery.innerHTML = '';
}

// Funkcja do obsługi formularza wyszukiwania
async function onSearch(event) {
  event.preventDefault();

  const searchInput = event.target.elements.query.value.trim();
  if (searchInput === '') {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search query.',
    });
    return;
  }

  clearGallery();
  currentQuery = searchInput;
  currentPage = 1;
  loadMoreBtn.style.display = 'none';

  const images = await fetchImages(currentQuery, currentPage);
  if (images.length > 0) {
    displayImages(images);

    if (currentPage * perPage < totalHits) {
      loadMoreBtn.style.display = 'block';
    } else {
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
      });
    }
  }
}

// Funkcja do obsługi przycisku "Load more"
async function onLoadMore() {
  currentPage += 1;
  loadMoreBtn.style.display = 'none';

  const images = await fetchImages(currentQuery, currentPage);
  if (images.length > 0) {
    displayImages(images);

    if (currentPage * perPage >= totalHits) {
      loadMoreBtn.style.display = 'none';
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      loadMoreBtn.style.display = 'block';
    }
    smoothScroll();
  }
}

// Funkcja do płynnego przewijania
function smoothScroll() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

// SimpleLightbox - inicjalizacja i odświeżanie
let lightbox = new SimpleLightbox('.gallery a');
function refreshLightbox() {
  lightbox.refresh();
}

// Event listener na formularz wyszukiwania
document.querySelector('#search-form').addEventListener('submit', onSearch);

// Event listener na przycisk "Load more"
loadMoreBtn.addEventListener('click', onLoadMore);

// Ukrywanie przycisku "Load more" na starcie
loadMoreBtn.style.display = 'none';
