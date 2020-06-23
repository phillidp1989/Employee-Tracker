// Validation to ensure a number is being entered
const numberValidation = (number) => {
  if (isNaN(number)) {
    return "Please enter a response consisting of numbers only";
  } else {
    return true;
  }
};

// Validation to ensure any data is being entered
const nameValidation = (input) => {
    const letters = /^[A-Za-z]+$/;
    if(input.match(letters)){
    return true;
  } else {
    return "Please enter a valid response";
  }
};

module.exports = {
  nameValidation,
  numberValidation,
};
