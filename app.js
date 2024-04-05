// Global Variables
let currentCountry;
let selectedSuggestionIndex = -1;
let countries = [];
let friendlyCountries = [];
let isProcessingGuess = false;
let guessInput;

// Initialize Game
function initializeGame() {
  fetchDataAndSetup();
  setupEventListeners();
}

// Fetch Data and Setup Game
function fetchDataAndSetup() {
  fetch('countries.json')
    .then(response => response.json())
    .then(data => {
      countries = data.countries;
      friendlyCountries = data.friendlyCountries;
      setRandomCountry();
    })
    .catch(error => console.error('Error loading the countries data:', error));
}

// Set Random Country and Display Flag
function setRandomCountry() {
  currentCountry = countries[Math.floor(Math.random() * countries.length)];
  displayFlag(currentCountry);
}

// Setup Event Listeners
function setupEventListeners() {
  guessInput = document.getElementById("guess");
  document.querySelector("form").addEventListener("submit", checkGuess);
  document.getElementById("skip").addEventListener("click", skipFlag);
  document.getElementById("reveal").addEventListener("click", revealAnswer);
  guessInput.addEventListener("input", filterSuggestions);
  document.addEventListener("click", hideSuggestionsOnClickOutside);
  guessInput.addEventListener("keydown", handleKeyDownForSuggestions);
}

// Display Flag
function displayFlag(country) {
  document.getElementById("flag").src = `https://cdn.countryflags.com/thumbs/${country}/flag-800.png`;
  guessInput.value = "";
  document.getElementById("result").textContent = "";
}

// Check Guess
function checkGuess(event) {
  event.preventDefault();
  if (isProcessingGuess) return console.log("Already processing a guess.");
  isProcessingGuess = true;

  // Normalize the input for comparison
  const inputValue = normalizeText(guessInput.value);
  const matchFound = findCountryMatch(inputValue);

  if (matchFound) {
    // Display success message and wait a moment before moving to the next flag
    document.getElementById("result").textContent = "You guessed correctly!";
    setTimeout(() => {
      setRandomCountry(); // Move to the next flag after a brief pause
      document.getElementById("result").textContent = ""; // Optionally clear the message after moving to the next flag
    }, 1000); // Adjust the delay here as needed
  } else {
    // Immediate feedback for incorrect guesses
    document.getElementById("result").textContent = "Try again!";
  }

  // Reset state and UI elements
  isProcessingGuess = false;
  document.getElementById("suggestions").style.display = "none";
  selectedSuggestionIndex = -1;
}

// Find Country Match
function findCountryMatch(inputValue) {
  // Attempt to find a country that matches the input value
  const matchedCountry = friendlyCountries.find(country => {
    const normalizedCountryName = normalizeText(country.name);
    return normalizedCountryName === inputValue || country.answers.some(answer => normalizeText(answer) === inputValue);
  });

  // Update currentCountry to the matched country for consistency
  if (matchedCountry) {
    currentCountry = matchedCountry.name;
    return true; // Match found
  }
  return false; // No match found
}

// Normalize Text
function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ").trim();
}

// Filter Suggestions
function filterSuggestions() {
  const filter = normalizeText(guessInput.value);
  const suggestionsPanel = document.getElementById('suggestions');
  suggestionsPanel.innerHTML = '';
  selectedSuggestionIndex = -1;

  if (filter) {
    const filteredCountries = friendlyCountries.filter(c => normalizeText(c.name).includes(filter));
    filteredCountries.forEach(country => createSuggestionElement(country.name, suggestionsPanel));
    suggestionsPanel.style.display = filteredCountries.length > 0 ? 'block' : 'none';
  } else {
    suggestionsPanel.style.display = "none";
  }
}

// Create Suggestion Element
function createSuggestionElement(countryName, parentElement) {
  const div = document.createElement('div');
  div.textContent = countryName;
  div.addEventListener('click', () => selectSuggestion(countryName));
  parentElement.appendChild(div);
}

// Select Suggestion
function selectSuggestion(countryName) {
  guessInput.value = countryName;
  document.getElementById('suggestions').style.display = 'none';
  checkGuess(new Event('submit'));
}

// Skip Flag
function skipFlag() {
  const previousCountryName = currentCountry;
  setRandomCountry(); // This will automatically update the flag and reset the guess input

  // Optionally display the name of the country that was skipped
  // Note: If you want to display the friendly name instead of the country code, you'll need to adjust this
  const friendlyName = friendlyCountries.find(country => normalizeText(country.name) === normalizeText(previousCountryName))?.name || "Unknown";
  document.getElementById("result").textContent = `Skipped: ${friendlyName}`;
}

// Reveal Answer
function revealAnswer() {
  const country = friendlyCountries.find(country => normalizeText(country.name) === normalizeText(currentCountry));
  const countryName = country ? country.name : "Unknown";
  document.getElementById("result").textContent = `The answer is: ${countryName}.`;
}

// Hide Suggestions on Click Outside
function hideSuggestionsOnClickOutside(event) {
  if (!guessInput.contains(event.target)) {
    document.getElementById("suggestions").style.display = "none";
  }
}

// Handle Key Down for Suggestions
function handleKeyDownForSuggestions(event) {
  // Implementation of arrow key navigation and selection logic
}

initializeGame();