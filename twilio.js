const twilio = require('twilio');
// Vos identifiants Twilio
const accountSid = 'AC70c005704aa651287f51766952676312';
const authToken = 'fa9b558d84f673393ebf3f3a0edd8215';
const client = twilio(accountSid, authToken);
// Fonction pour envoyer un SMS
function sendSMS(reminder) {
    client.messages
        .create({
            body: `Rappel : ${reminder.title} à ${new Date(reminder.date).toLocaleString()}`,
            to: '+33764831309', // Numéro de téléphone de l'utilisateur
            from: '+16202702704' // Numéro fourni par Twilio
        })
        .then((message) => console.log(`Message envoyé avec l'ID : ${message.sid}`))
        .catch((error) => console.error('Erreur lors de l\'envoi du message :', error));
}
// Fonction pour afficher une boîte de dialogue de confirmation
function showConfirmationDialog() {
    const confirmed = confirm("Avez-vous pris votre médicament ?");
    if (confirmed) {
        alert("Merci d'avoir confirmé !");
    } else {
        alert("Rappelez-vous de le prendre dès que possible !");
    }
}
