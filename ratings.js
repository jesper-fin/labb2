const API_KEY = "7bd4e999b4bfa5458c6bda440c8af60d";
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
const API_URL_PAGE_2 = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=2`;
const GENRES_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;

const galleryRow = document.querySelector(".gallery-row");
const genreDropdownList = document.getElementById("genreDropdownList");

let genreMap = {};
let allMovies = [];

async function fetchGenres() {
  try {
    const response = await fetch(GENRES_URL);
    const data = await response.json();
    genreMap = data.genres.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});
  } catch (error) {
    console.error("Error fetching genres:", error);
  }
}

async function fetchPopularMovies() {
  try {
    const response1 = await fetch(API_URL);
    const response2 = await fetch(API_URL_PAGE_2);

    const data1 = await response1.json();
    const data2 = await response2.json();

    allMovies = [...data1.results, ...data2.results];

    const sortedByRatings = [...allMovies].sort(
      (a, b) => b.vote_average - a.vote_average
    );

    displayMoviesInGallery(sortedByRatings);
  } catch (error) {
    console.error("Error fetching popular movies:", error);
  }
}

function displayMoviesInGallery(movies) {
  galleryRow.innerHTML = "";

  if (movies.length === 0) {
    const noMoviesMessage = document.createElement("div");
    noMoviesMessage.classList.add("no-movies-message");

    const messageText = document.createElement("p");
    messageText.textContent = "We seemed to have ran out of movies =C";
    noMoviesMessage.appendChild(messageText);

    galleryRow.appendChild(noMoviesMessage);
    return;
  }

  movies.forEach((movie) => {
    const imagePath = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    const hoverCard = document.createElement("div");
    hoverCard.classList.add("hover-card");

    const img = document.createElement("img");
    img.src = imagePath;
    img.alt = movie.title;
    img.classList.add("gallery-image");

    const hoverContent = document.createElement("div");
    hoverContent.classList.add("hover-content");

    const title = document.createElement("h3");
    title.textContent = movie.title;

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${movie.vote_average.toFixed(1)}`;

    hoverContent.appendChild(title);
    hoverContent.appendChild(rating);

    hoverCard.appendChild(img);
    hoverCard.appendChild(hoverContent);

    galleryRow.appendChild(hoverCard);
  });
}

async function populateGenreDropdown() {
  try {
    const response = await fetch(GENRES_URL);
    const data = await response.json();
    data.genres.forEach((genre) => {
      const genreItem = document.createElement("li");
      genreItem.innerHTML = `<a class="dropdown-item" href="#" data-genre-id="${genre.id}">${genre.name}</a>`;
      genreDropdownList.appendChild(genreItem);
    });

    const genreItems = document.querySelectorAll(".dropdown-item");
    genreItems.forEach((item) => {
      item.addEventListener("click", handleGenreClick);
    });
  } catch (error) {
    console.error("Error populating genres:", error);
  }
}

function handleGenreClick(event) {
  event.preventDefault();
  const selectedGenreId = parseInt(event.target.getAttribute("data-genre-id"));

  const filteredMovies = allMovies.filter((movie) =>
    movie.genre_ids.includes(selectedGenreId)
  );

  const sortedFilteredMovies = filteredMovies.sort(
    (a, b) => b.vote_average - a.vote_average
  );

  displayMoviesInGallery(sortedFilteredMovies);
}

document.getElementById("pills-popular-tab").addEventListener("click", () => {
  fetchPopularMovies();
});

async function init() {
  await fetchGenres();
  populateGenreDropdown();
  fetchPopularMovies();
}

init();
