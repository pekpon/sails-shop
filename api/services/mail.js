var email = require("emailjs");

var server = email.server.connect(sails.config.settings.email);

module.exports = {

    send: function(text, subject, emailTo, nameTo, cb) {
        // send the message and get a callback with an error or details of the message that was sent
        server.send({
            text: "",
            from: sails.config.settings.shopName + " <" + sails.config.settings.email.email + ">",
            to: nameTo + " <" + emailTo + ">",
            subject: subject,
            attachment: [{
                data: text,
                alternative: true
            }]
        }, function(err, message) {
            cb(err, message);
        });
    }

}
