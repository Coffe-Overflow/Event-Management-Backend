// Serviciul de Notificări (Aici s-ar face integrarea reală cu un serviciu de email: Nodemailer, SendGrid, etc.)

exports.sendNotification = async (recipients, subject, body) => {
    // În realitate, aici s-ar folosi:
    /* const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({...});
    await transporter.sendMail({
        from: '"Nume Aplicatie" <no-reply@usv.ro>',
        to: recipients, // Lista de emailuri separată prin virgulă
        subject: subject,
        html: body,
    });
    */

    // Placeholder: Înregistrăm în consolă acțiunea
    console.log("--- ACȚIUNE REALĂ: TRIMITERE NOTIFICARE ---");
    console.log(`DESTINATARI: ${recipients.substring(0, 50)}...`); 
    console.log(`SUBIECT: ${subject}`);
    console.log(`MESAJ: ${body.substring(0, 100)}...`);
    console.log(`DATA: ${new Date().toISOString()}`);
    console.log("---------------------------------------");
    
    // Simulare de răspuns reușit
    return { 
        success: true, 
        message: `Notificare trimisă (simulat) către ${recipients.split(',').length} destinatari.`,
        recipients: recipients
    };
};

// Exemplu de funcție pentru a fi apelată automat din events.service.js la înscriere
exports.sendRegistrationConfirmation = async (email, eventTitle) => {
    const subject = `Înscrierea la ${eventTitle} a fost confirmată!`;
    const body = `Salut, înscrierea ta la evenimentul "${eventTitle}" a fost înregistrată cu succes. Te așteptăm!`;
    return exports.sendNotification(email, subject, body);
};