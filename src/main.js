// Klucz API do Pixabay
const apiKey = '46058905-76d6ace161caaf887286baf22'; // Wprowadź swój klucz API
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const gallery = document.getElementById('gallery');
const loadingIndicator = document.getElementById('loading-indicator');
const loadMoreBtn = document.getElementById('load-more');

let lightbox = new SimpleLightbox('.gallery a');
let currentPage = 1;
let currentQuery = '';
let totalHits = 0;

// Funkcja do czyszczenia galerii
function clearGallery() {
  gallery.innerHTML = '';
  currentPage = 1;
  loadMoreBtn.style.display = 'none'; // Ukryj przycisk
}

// Funkcja do wyświetlania wskaźnika ładowania
function showLoading() {
  loadingIndicator.style.display = 'block';
}

// Funkcja do ukrywania wskaźnika ładowania
function hideLoading() {
  loadingIndicator.style.display = 'none';
}

// Funkcja do wyświetlania obrazów w galerii
function displayImages(images) {
  images.forEach(image => {
    const galleryItem = document.createElement('li');
    galleryItem.classList.add('gallery-item');

    const imageLink = document.createElement('a');
    imageLink.href = image.largeImageURL;

    const imageElement = document.createElement('img');
    imageElement.src = image.webformatURL;
    imageElement.alt = image.tags;

    imageLink.appendChild(imageElement);
    galleryItem.appendChild(imageLink);
    gallery.appendChild(galleryItem);
  });

  lightbox.refresh();
}

// Funkcja do obsługi błędów
function showError(message) {
  iziToast.error({
    title: 'Błąd',
    message: message,
  });
}

// Funkcja do wyszukiwania obrazów
async function searchImages(query) {
  clearGallery();
  showLoading();
  currentQuery = query; // Zapisz aktualne zapytanie

  try {
    const response = await axios.get(`https://pixabay.com/api/`, {
      params: {
        key: apiKey,
        q: encodeURIComponent(query),
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: 40,
      },
    });

    totalHits = response.data.totalHits; // Zapisz całkowitą liczbę wyników
    hideLoading();

    if (response.data.hits.length === 0) {
      showError(
        'Sorry, there are no images matching your search query. Please try again!'
      );
      return;
    }

    displayImages(response.data.hits);
    loadMoreBtn.style.display = 'block'; // Pokaż przycisk „Load more”

    if (currentPage * 40 >= totalHits) {
      loadMoreBtn.style.display = 'none'; // Ukryj przycisk, jeśli osiągnięto koniec wyników
      showError("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    hideLoading();
    showError(
      'Wystąpił błąd podczas pobierania obrazów. Spróbuj ponownie później.'
    );
  }
}

// Funkcja do ładowania kolejnej strony
async function loadMoreImages() {
  currentPage += 1; // Zwiększ stronę
  showLoading();

  try {
    const response = await axios.get(`https://pixabay.com/api/`, {
      params: {
        key: apiKey,
        q: encodeURIComponent(currentQuery),
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: 40,
      },
    });

    hideLoading();

    displayImages(response.data.hits);

    if (currentPage * 40 >= totalHits) {
      loadMoreBtn.style.display = 'none'; // Ukryj przycisk, jeśli osiągnięto koniec wyników
      showError("We're sorry, but you've reached the end of search results.");
    }

    // Przewiń stronę
    const galleryItemHeight = document
      .querySelector('.gallery-item')
      .getBoundingClientRect().height;
    window.scrollBy({
      top: galleryItemHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    hideLoading();
    showError(
      'Wystąpił błąd podczas ładowania kolejnych obrazów. Spróbuj ponownie później.'
    );
  }
}

// Funkcja do obsługi formularza
form.addEventListener('submit', event => {
  event.preventDefault();
  const query = input.value.trim();

  if (query === '') {
    showError('Proszę wpisać hasło do wyszukania.');
    return;
  }

  searchImages(query);
});

// Funkcja do obsługi przycisku „Load more”
loadMoreBtn.addEventListener('click', loadMoreImages);
