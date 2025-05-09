/*================== contact to email ================== */
const form = document.getElementById("sendMessage");
function sendEmail() {
    Email.send({
        Host : "smtp.elasticemail.com",
        Username : "xuannincntt@gmail.com",
        Password : "B6AB31E5A5674F0BA070C46B7768A77CFF8C",
        To : 'xuannincntt@gmail.com',
        From : "xuannincntt@gmail.com",
        Subject : "This is the subject",
        Body : "And this is the body"
    }).then(
      message => alert(message)
    );
}
form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendEmail();
});