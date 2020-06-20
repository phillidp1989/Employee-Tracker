const numberValidation = number => {
    if (isNaN(number)) {
        return "Please enter a response consisting of numbers only";
        
    } else {

        return true;
    }
};

const nameValidation = input => {
    if (input === "" || input === undefined) {
        return "Please enter a valid response";

    } else {

        return true;
    }
};

module.exports = {
    nameValidation,
    numberValidation
};