const API_KEY = "7bd4e999b4bfa5458c6bda440c8af60d";
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
const API_URL_PAGE_2 = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=2`; // Second page of movies
const GENRES_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;

const galleryRow = document.querySelector(".gallery-row");
const genreDropdownList = document.getElementById("genreDropdownList");

let genreMap = {};
let allMovies = []; // To store all movies after combining pages

// fetch genres
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

// fetch popular movies from both pages
async function fetchPopularMovies() {
  try {
    const response1 = await fetch(API_URL);
    const response2 = await fetch(API_URL_PAGE_2);

    const data1 = await response1.json();
    const data2 = await response2.json();

    // Combine results from both pages
    allMovies = [...data1.results, ...data2.results];

    displayMoviesInGallery(allMovies); // Display all movies initially
  } catch (error) {
    console.error("Error fetching popular movies:", error);
  }
}

// display movies in the gallery
function displayMoviesInGallery(movies) {
  galleryRow.innerHTML = ""; // Clear existing movies

  // If no movies are found, display the no Movies Available =C message with the background
  if (movies.length === 0) {
    const noMoviesMessage = document.createElement("div");
    noMoviesMessage.classList.add("no-movies-message");

    const messageText = document.createElement("p");
    messageText.textContent = "We seemed to have ran out of movies =C";
    noMoviesMessage.appendChild(messageText);

    galleryRow.appendChild(noMoviesMessage);
    return;
  }

  // loop through the movies and create a hover-card for each one
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

    const genres = document.createElement("p");
    genres.textContent = movie.genre_ids.map((id) => genreMap[id]).join(", ");

    hoverContent.appendChild(title);
    hoverContent.appendChild(genres);

    hoverCard.appendChild(img);
    hoverCard.appendChild(hoverContent);

    galleryRow.appendChild(hoverCard);
  });
}

// populate genres in the dropdown and add click event listeners
async function populateGenreDropdown() {
  try {
    const response = await fetch(GENRES_URL);
    const data = await response.json();
    data.genres.forEach((genre) => {
      const genreItem = document.createElement("li");
      genreItem.innerHTML = `<a class="dropdown-item" href="#" data-genre-id="${genre.id}">${genre.name}</a>`;
      genreDropdownList.appendChild(genreItem);
    });

    // add click event listener to each genre item
    const genreItems = document.querySelectorAll(".dropdown-item");
    genreItems.forEach((item) => {
      item.addEventListener("click", handleGenreClick);
    });
  } catch (error) {
    console.error("Error populating genres:", error);
  }
}

// Handle genre click event to filter movies by genre
function handleGenreClick(event) {
  event.preventDefault();
  const selectedGenreId = parseInt(event.target.getAttribute("data-genre-id"));

  // Filter movies by the selected genre
  const filteredMovies = allMovies.filter((movie) =>
    movie.genre_ids.includes(selectedGenreId)
  );

  // Display the filtered movies
  displayMoviesInGallery(filteredMovies);
}

// Function to sort movies by release date (latest first)
function sortMoviesByReleaseDate() {
  const sortedMovies = [...allMovies].sort(
    (a, b) => new Date(b.release_date) - new Date(a.release_date)
  );
  displayMoviesInGallery(sortedMovies); // Display the sorted movies
}

// Adding event listener to the "popular" tab
document.getElementById("pills-popular-tab").addEventListener("click", () => {
  fetchPopularMovies(); // Fetch and display all popular movies (already sorted by popularity)
});

// Adding event listener to "latest" tab sort by release date
document.getElementById("pills-rating-tab").addEventListener("click", () => {
  sortMoviesByReleaseDate(); // Sort and display movies based on release date
});

document.querySelector(".star-icon").addEventListener("click", function () {
  const starIcon = this;
  const targetSection = document.querySelector(
    starIcon.getAttribute("data-target")
  );

  // Trigger jump animation by adding and removing "clicked" class
  starIcon.classList.add("clicked");

  // remove the "clicked" class after animation complete
  setTimeout(() => {
    starIcon.classList.remove("clicked");

    // Scroll to target section smoothly with the star jumping
    targetSection.scrollIntoView({ behavior: "smooth" });

    // After scrolling make the star return to its original position
    setTimeout(() => {
      starIcon.style.transition = "transform 0.5s ease";
      starIcon.style.transform = "translateY(0)";
    }, 1000);
  }, 400);
});

// Initialize the page
async function init() {
  await fetchGenres();
  populateGenreDropdown(); // Populate genres in dropdown
  fetchPopularMovies(); // Fetch and display all popular movies
}

// Call the function to load genres and movies on page load
init();
