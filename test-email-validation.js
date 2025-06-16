// Test different email formats
const testEmails = [
    'test@example.com',
    'test@gmail.com', 
    'jz18@yvg.vic.edu.au',
    'test123@yahoo.com'
];

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

testEmails.forEach(email => {
    console.log(`${email}: ${validateEmail(email) ? 'Valid' : 'Invalid'}`);
});

// Check for any special characters or issues
const problemEmail = 'jz18@yvg.vic.edu.au';
console.log('Problem email analysis:');
console.log('Length:', problemEmail.length);
console.log('Contains special chars:', /[^a-zA-Z0-9@._-]/.test(problemEmail));
console.log('Encoded:', encodeURIComponent(problemEmail));
