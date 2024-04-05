// Global Variables
let currentCountry;
let countries = [];
let selectedSuggestionIndex = -1;
let isProcessingGuess = false;
let guessInput;
let correctGuesses = 0; // Track correct guesses
let skippedCountries = 0; // Track skipped countries

// Initialize Game
function initializeGame() {
  guessInput = document.getElementById("guess");
  fetchDataAndSetup();
  setupEventListeners();
  updateScoreDisplay(); // Initialize the score display
}

// Fetch Data and Setup Game
function fetchDataAndSetup() {
  fetch('./unified_countries.json') // Adjust the path as necessary
    .then(response => response.json())
    .then(data => {
      countries = data.countries;
      setRandomCountry();
    })
    .catch(error => console.error('Error loading the countries data:', error));
}

// Set Random Country and Display Flag
function setRandomCountry() {
  const randomIndex = Math.floor(Math.random() * countries.length);
  currentCountry = countries[randomIndex];
  displayFlag();
}

// Display Flag
function displayFlag() {
  const flagURL = `https://cdn.countryflags.com/thumbs/${currentCountry.key}/flag-800.png`;
  document.getElementById("flag").src = flagURL;
  guessInput.value = "";
  document.getElementById("result").textContent = "";
}

// Setup Event Listeners
function setupEventListeners() {
  document.querySelector("form").addEventListener("submit", checkGuess);
  document.getElementById("skip").addEventListener("click", skipFlag);
  document.getElementById("reveal").addEventListener("click", revealAnswer);
  guessInput.addEventListener("input", filterSuggestions);
  guessInput.addEventListener("keydown", handleKeyDownForSuggestions);

  document.addEventListener("click", (event) => {
    const guessContainer = document.getElementById('guess-container');
    const suggestionsPanel = document.getElementById('suggestions');
    if (!guessContainer.contains(event.target)) {
      suggestionsPanel.style.display = 'none';
      // Reset the border-radius regardless of suggestions visibility
      guessContainer.style.borderRadius = '0.5em';
    }
  });
}

// Update Score Display
function updateScoreDisplay() {
  document.getElementById("correctGuesses").textContent = `Correct Guesses: ${correctGuesses}`;
  document.getElementById("skippedCountries").textContent = `Skipped Countries: ${skippedCountries}`;
}

// Check Guess
function checkGuess(event) {
  event.preventDefault();
  if (isProcessingGuess) return;
  isProcessingGuess = true;

  const inputValue = normalizeText(guessInput.value);
  const matchFound = currentCountry.answers.some(answer => normalizeText(answer) === inputValue);

  if (matchFound) {
    document.getElementById("result").textContent = "You guessed correctly!";
    correctGuesses++;
    updateScoreDisplay();
    setTimeout(setRandomCountry, 1000); // Move on to the next flag after 1 second
  } else {
    document.getElementById("result").textContent = "Try again!";
    // Clear the "Try again!" message after 1 second
    setTimeout(() => {
      document.getElementById("result").textContent = "";
    }, 1000);
  }

  isProcessingGuess = false;
}

// Normalize Text
function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
}

// Reveal Answer and treat it like a skip for score
function revealAnswer() {
  document.getElementById("result").textContent = `The answer is: ${currentCountry.name}.`;
  skippedCountries++; // Increment skipped countries as revealing is treated like skipping
  updateScoreDisplay(); // Update score display
  setTimeout(setRandomCountry, 1500); // Delay before showing the next flag
}

// Skip Flag and Temporarily Show Skipped Country Name
function skipFlag(event) {
  event.preventDefault();

  // Temporarily show the skipped country's name
  const skippedCountryName = currentCountry.name; // Store the name of the current country
  setRandomCountry(); // Immediately set a new random country

  document.getElementById("result").textContent = `Skipped: ${skippedCountryName}`;
  skippedCountries++; // Increment skipped countries count
  updateScoreDisplay(); // Update score display
  
  // Clear the "Skipped: ..." message after 2000ms
  setTimeout(() => {
    document.getElementById("result").textContent = "";
  }, 1500);
}

// Filter Suggestions
function filterSuggestions() {
  const input = normalizeText(guessInput.value);
  const suggestionsPanel = document.getElementById('suggestions');
  const guessContainer = document.getElementById('guess-container');
  suggestionsPanel.innerHTML = '';

  const filteredCountries = countries.filter(country =>
    normalizeText(country.name).includes(input) ||
    country.answers.some(answer => normalizeText(answer).includes(input))
  );

  filteredCountries.forEach(country => {
    const div = document.createElement('div');
    div.textContent = country.name;
    div.addEventListener('click', () => {
      guessInput.value = country.name;
      checkGuess(new Event('submit'));
      // Hide suggestions after selection
      suggestionsPanel.style.display = 'none';
      guessContainer.style.borderRadius = '0.5em'; // Reset border radius
    });
    suggestionsPanel.appendChild(div);
  });

  if (filteredCountries.length > 0) {
    suggestionsPanel.style.display = 'block';
    guessContainer.style.borderRadius = '0.5em 0.5em 0em 0em'; // Adjust border radius for suggestions visibility
  } else {
    suggestionsPanel.style.display = 'none';
    guessContainer.style.borderRadius = '0.5em'; // Reset border radius when no suggestions
  }
}

// Handle Key Down for Suggestions
function handleKeyDownForSuggestions(event) {
  const suggestionsPanel = document.getElementById('suggestions');
  const suggestions = suggestionsPanel.querySelectorAll('div');

  if (!suggestions.length) return;

  // Capture current scroll position to maintain it after navigating suggestions
  let currentScrollPosition = suggestionsPanel.scrollTop;

  switch (event.key) {
    case 'ArrowDown':
      if (selectedSuggestionIndex < suggestions.length - 1) {
        selectedSuggestionIndex++;
      } else {
        selectedSuggestionIndex = 0; // Loop back to the top
      }
      event.preventDefault(); // Prevent cursor from moving to the end of input
      break;
    case 'ArrowUp':
      if (selectedSuggestionIndex > 0) {
        selectedSuggestionIndex--;
      } else {
        selectedSuggestionIndex = suggestions.length - 1; // Loop back to the bottom
      }
      event.preventDefault(); // Prevent cursor from moving to the start of input
      break;
    case 'Enter':
      event.preventDefault(); // Prevent form submission
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        suggestions[selectedSuggestionIndex].click();
      }
      return; // Exit the function to avoid deselecting
    default:
      return; // Exit for all other keys to allow normal input behavior
  }

  // Highlight the selected suggestion and scroll into view if necessary
  highlightSuggestion(suggestions, selectedSuggestionIndex);
  
  // Restore the scroll position to where it was before navigating
  suggestionsPanel.scrollTop = currentScrollPosition;
}

function highlightSuggestion(suggestions, index) {
  suggestions.forEach((div, i) => {
    if (i === index) {
      div.classList.add('highlighted');
      // Optionally, scroll into view
      div.scrollIntoView({ block: 'nearest', inline: 'start' });
    } else {
      div.classList.remove('highlighted');
    }
  });
}

// Initialize the game
document.addEventListener('DOMContentLoaded', initializeGame);
