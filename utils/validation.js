// middleware.js

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};


const isValidName = (name) => {
     return name.trim().length > 0; 
};

module.exports = {
    isValidEmail,
    isValidName
};

