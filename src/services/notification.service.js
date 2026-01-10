exports.sendNotification = async (recipients, subject, body) => {

    console.log("--- ACȚIUNE REALĂ: TRIMITERE NOTIFICARE ---");
    console.log(`DESTINATARI: ${recipients.substring(0, 50)}...`); 
    console.log(`SUBIECT: ${subject}`);
    console.log(`MESAJ: ${body.substring(0, 100)}...`);
    console.log(`DATA: ${new Date().toISOString()}`);
    console.log("---------------------------------------");

    return { 
        success: true, 
        message: `Notificare trimisă (simulat) către ${recipients.split(',').length} destinatari.`,
        recipients: recipients
    };
};

exports.sendRegistrationConfirmation = async (email, eventTitle) => {
    const subject = `Înscrierea la ${eventTitle} a fost confirmată!`;
    const body = `Salut, înscrierea ta la evenimentul "${eventTitle}" a fost înregistrată cu succes. Te așteptăm!`;
    return exports.sendNotification(email, subject, body);
};

module.exports = { };