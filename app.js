let currentCountry;

// These will be populated with data from the JSON file
let countries = [];
let friendlyCountries = [];

// Fetch the countries data from the JSON file
fetch('countries.json')
  .then(response => response.json())
  .then(data => {
    countries = data.countries;
    friendlyCountries = data.friendlyCountries;

    // Initialize the game after the data is loaded
    initializeGame();
  })
  .catch(error => console.error('Error loading the countries data:', error));

function initializeGame() {
  currentCountry = getRandomCountry();
  displayFlag(currentCountry);

  const form = document.querySelector("form");
  const skipButton = document.getElementById("skip");
  const revealButton = document.getElementById("reveal");

  form.addEventListener("submit", checkGuess);
  skipButton.addEventListener("click", skipFlag);
  revealButton.addEventListener("click", revealAnswer);

  document.addEventListener("keydown", function(event) {
    if (event.keyCode === 39) { // right arrow key
      skipButton.click(); // trigger a click event on the skip button
    }
  });
}

function getRandomCountry() {
  return countries[Math.floor(Math.random() * countries.length)];
}

function getFlagUrl(country) {
  return `https://cdn.countryflags.com/thumbs/${country}/flag-400.png`;
}

function displayFlag(country) {
  const flagContainer = document.getElementById("flag-container");
  const flagImg = document.getElementById("flag");
  const guessInput = document.getElementById("guess");
  const result = document.getElementById("result");

  const url = getFlagUrl(country);
  flagImg.src = url;
  flagImg.alt = `Flag of ${country}`;
  guessInput.value = "";
  guessInput.focus({ preventScroll: true });
  result.textContent = "";
  currentCountry = country;
}

function checkGuess(event) {
  event.preventDefault();
  const guessInput = document.getElementById("guess");
  const result = document.getElementById("result");
  const guess = guessInput.value.toLowerCase();
  const countryIndex = countries.indexOf(currentCountry);
  const possibleAnswers = friendlyCountries[countryIndex].answers;

  if (possibleAnswers.includes(guess)) {
    result.textContent = "Correct!";
    let newCountry = getRandomCountry();
    while (newCountry === currentCountry) {
      newCountry = getRandomCountry();
    }
    displayFlag(newCountry);
  } else {
    result.textContent = "Try again!";
  }
}

function skipFlag() {
  let newCountry = getRandomCountry();
  while (newCountry === currentCountry) {
    newCountry = getRandomCountry();
  }
  displayFlag(newCountry);
}

function revealAnswer() {
  const result = document.getElementById("result");
  const countryIndex = countries.indexOf(currentCountry);
  const countryName = friendlyCountries[countryIndex].name;
  result.textContent = `The answer is ${countryName}.`;
}