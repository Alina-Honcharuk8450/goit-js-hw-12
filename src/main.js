import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const PER_PAGE = 15;

const formEl = document.querySelector('.form');
const loadMoreBtnEl = document.querySelector('.btn-load-more');

let searchQuery = '';
let page = 1;

async function fetchAndRenderImages() {
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(searchQuery, page);

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    const totalPages = Math.ceil(data.totalHits / PER_PAGE);

    if (page < totalPages) {
      showLoadMoreButton();
    } else {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

    if (page > 1) {
      scrollPage();
    }
  } catch (error) {
    iziToast.error({
      message: `Something went wrong: ${error.message}`,
      position: 'topRight',
    });

    if (page > 1) {
      page -= 1;
      showLoadMoreButton();
    }
  } finally {
    hideLoader();
  }
}

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function handleSubmit(event) {
  event.preventDefault();

  const query = event.target.elements['search-text'].value.trim();

  if (query === '') {
    return;
  }

  searchQuery = query;
  page = 1;

  clearGallery();
  hideLoadMoreButton();

  fetchAndRenderImages();
}

function handleLoadMore() {
  page += 1;

  fetchAndRenderImages();
}

formEl.addEventListener('submit', handleSubmit);
loadMoreBtnEl.addEventListener('click', handleLoadMore);