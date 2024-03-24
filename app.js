let currentCountry;
let selectedSuggestionIndex = -1; // Track the index of the selected suggestion

// These will be populated with data from the JSON file
let countries = [];
let friendlyCountries = [];

let guessInput;
let isProcessingGuess = false;


// Fetch the countries data from the JSON file
fetch('countries.json')
  .then(response => response.json())
  .then(data => {
    countries = data.countries;
    friendlyCountries = data.friendlyCountries;
    initializeGame();
  })
  .catch(error => console.error('Error loading the countries data:', error));

  function initializeGame() {
    currentCountry = getRandomCountry();
    displayFlag(currentCountry);
  
    const form = document.querySelector("form");
    const skipButton = document.getElementById("skip");
    const revealButton = document.getElementById("reveal");
    guessInput = document.getElementById("guess"); // Assign guessInput here
    const suggestionsPanel = document.getElementById("suggestions");
  
    form.addEventListener("submit", checkGuess);
    skipButton.addEventListener("click", skipFlag);
    revealButton.addEventListener("click", revealAnswer);
    guessInput.addEventListener("input", filterSuggestions);
  
    // Event listener for handling paste events on the guess input
    guessInput.addEventListener('paste', (event) => {
      setTimeout(() => { lastPasteTime = Date.now(); }, 0); // Ensure paste completion
    });
  
    document.addEventListener("click", (event) => {
      if (!guessInput.contains(event.target)) {
        suggestionsPanel.style.display = "none";
      }
    });
  
    guessInput.addEventListener("keydown", (event) => handleKeyDown(event, guessInput));
  
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        suggestionsPanel.style.display = 'none';
      }
    });
  
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && suggestionsPanel.style.display !== "block") {
        event.preventDefault();
        checkGuess(new Event('submit'));
      }
    });
  
    // Modify the event listener to include arrow key navigation
    guessInput.addEventListener("keydown", (event) => {
      const suggestions = document.querySelectorAll("#suggestions div");
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (selectedSuggestionIndex < suggestions.length - 1) {
          selectedSuggestionIndex++;
          highlightSuggestion(suggestions);
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (selectedSuggestionIndex > 0) {
          selectedSuggestionIndex--;
          highlightSuggestion(suggestions);
        }
      } else if (event.key === "Enter" && selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
        event.preventDefault();
        suggestions[selectedSuggestionIndex].click();
      }
    });
  }  

function getRandomCountry() {
  return countries[Math.floor(Math.random() * countries.length)];
}

function getFlagUrl(country) {
  return `https://cdn.countryflags.com/thumbs/${country}/flag-800.png`;
}

function displayFlag(country) {
  const flagContainer = document.getElementById("flag-container");
  const flagImg = document.getElementById("flag");
  flagImg.src = getFlagUrl(country);
  flagImg.alt = `Flag of ${country}`;
  document.getElementById("guess").value = "";
  currentCountry = country;
}

function checkGuess(event) {
  event.preventDefault();

  // Prevent processing if a guess is already being processed
  if (isProcessingGuess) {
    console.log("Already processing a guess.");
    return;
  }

  isProcessingGuess = true;

  // Capture and normalize the input value for comparison
  const inputValue = normalizeText(guessInput.value);
  console.log("Processing guess with normalized value: ", inputValue);

  let foundMatch = false;
  // Iterate through the friendlyCountries array to find a match
  friendlyCountries.forEach(country => {
    country.answers.forEach(answer => {
      if (normalizeText(answer) === inputValue) {
        foundMatch = true;
        console.log("Match found for: ", country.name); // Log the matching country name
      }
    });
  });

  if (foundMatch) {
    console.log("Setting correct message");
    document.getElementById("result").textContent = "You guessed correctly!";
    moveToNextFlag(); // Move to the next flag if the guess is correct
  } else {
    console.log("No match found. Setting try again message.");
    document.getElementById("result").textContent = "Try again!"; // Prompt the user to try again if no match is found
  }

  document.getElementById("suggestions").style.display = "none"; // Hide the suggestions panel
  selectedSuggestionIndex = -1; // Reset the selected suggestion index

  isProcessingGuess = false; // Reset the flag after processing
}

// The normalizeText function ensures consistent formatting for comparisons
function normalizeText(text) {
  return text
    .toLowerCase() // Convert the text to lowercase
    .replace(/'/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]+/g, ' ') // Replace non-alphanumeric characters with spaces
    .trim(); // Trim whitespace from both ends of the text
}

function filterSuggestions() {
  const input = document.getElementById('guess');
  const filter = input.value.toLowerCase();
  const suggestionsPanel = document.getElementById('suggestions');
  suggestionsPanel.innerHTML = '';
  selectedSuggestionIndex = -1;

  if (!filter) {
    suggestionsPanel.style.display = "none";
    return;
  }

  const filteredCountries = friendlyCountries.filter(c => c.name.toLowerCase().includes(filter));
  filteredCountries.forEach((country, index) => {
    const div = document.createElement('div');
    div.textContent = country.name;
    div.addEventListener('click', () => {
      input.value = country.name;
      suggestionsPanel.style.display = 'none';
    });

    suggestionsPanel.appendChild(div);
  });

  suggestionsPanel.style.display = filteredCountries.length > 0 ? 'block' : 'none';
}

function skipFlag() {
  const currentCountryIndex = countries.indexOf(currentCountry);
  const countryName = friendlyCountries[currentCountryIndex]?.name || "Unknown";

  let newCountry = getRandomCountry();
  while (newCountry === currentCountry) {
    newCountry = getRandomCountry();
  }
  currentCountry = newCountry;
  displayFlag(currentCountry);

  document.getElementById("result").textContent = `Skipped: ${countryName}`;
}

function revealAnswer() {
  const countryIndex = countries.indexOf(currentCountry);
  const countryName = friendlyCountries[countryIndex].name;
  document.getElementById("result").textContent = `The answer is ${countryName}.`;
}

function handleKeyDown(event, guessInput) {
  const suggestions = document.querySelectorAll("#suggestions div");
  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (selectedSuggestionIndex < suggestions.length - 1) {
      selectedSuggestionIndex++;
      highlightSuggestion(suggestions);
    }
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    if (selectedSuggestionIndex > 0) {
      selectedSuggestionIndex--;
      highlightSuggestion(suggestions);
    }
  } else if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission when selecting a suggestion
    if (selectedSuggestionIndex >= 0 && suggestions.length > 0) {
      // Set the value of the guess input to the text content of the selected suggestion
      guessInput.value = suggestions[selectedSuggestionIndex].textContent;
      // Hide the suggestions panel
      document.getElementById("suggestions").style.display = "none";
      // Reset the selected suggestion index
      selectedSuggestionIndex = -1;
    } else {
      // If no suggestion is selected, submit the form
      checkGuess(new Event('submit'));
    }
  }
}
  
function moveToNextFlag() {
  let newCountry = getRandomCountry();
  while (newCountry === currentCountry) {
    newCountry = getRandomCountry();
  }
  currentCountry = newCountry;
  displayFlag(currentCountry);
  document.getElementById("suggestions").style.display = "none";
  selectedSuggestionIndex = -1;
}

// Modify this function to handle arrow key navigation and selection within the suggestions
function highlightSuggestion(suggestions) {
  suggestions.forEach((suggestion, index) => {
    if (index === selectedSuggestionIndex) {
      suggestion.style.backgroundColor = "#f0f0f0";
      suggestion.scrollIntoView({block: "nearest"});
    } else {
      suggestion.style.backgroundColor = "";
    }
  });
}