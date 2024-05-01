const fs = require('fs'); // 
const { ethers } = require('ethers'); // 
const bip39 = require('bip39'); // 
const sendEmail = require('./email'); // 
const axios = require('axios'); // HTTP 

// 延迟函数
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 从文件中读取 RPC 节点
const rpcUrls = fs.readFileSync('rpc.txt', 'utf8').split('\n');
let currentRpcIndex = 0; // 当前使用的 RPC 节点索引

// 生成随机以太坊钱包
function generateRandomWallet() {
    const mnemonic = bip39.generateMnemonic(); // 生成随机助记词
    const wallet = ethers.Wallet.fromMnemonic(mnemonic); // 使用助记词创建钱包
    return { address: wallet.address, privateKey: wallet.privateKey }; // 返回钱包地址和私钥
}

// 保存钱包地址和私钥到文件
function saveWalletToFile(wallet) {
    const data = `${wallet.address},${wallet.privateKey}\n`; // 保存地址和私钥
    fs.appendFileSync('88.txt', data, 'utf8'); // 写入到 88.txt
}

// 查询钱包余额
async function queryWalletBalance(wallet, rpcUrl) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl); // 创建 RPC 提供程序
        const balance = await provider.getBalance(wallet.address); // 查询余额
        return balance.toString(); // 返回余额字符串
    } catch (error) {
        console.error(`Error querying balance for ${wallet.address} on RPC ${rpcUrl}: ${error.message}`); // 错误处理
        return '0'; // 查询失败返回 0
    }
}

// 
async function pushToPushPlus(message) {
    const pushPlusToken = '9b782195fcdf4bb084a527cc8420ba34'; // 
    const url = `http://www.pushplus.plus/send?token=${pushPlusToken}&title=ETH%E9%92%B1%E5%8C%85%E6%9F%A5%E8%AF%A2&content=${encodeURIComponent(message)}`;
    try {
        await axios.get(url);
    } catch (error) {
        console.error('Error pushing to PushPlus:', error.message);
    }
}

// 生成钱包并查询余额
async function generateWalletsAndQueryBalance() {
    let count = 0; // 用于跟踪生成的钱包数量

    while (true) { // 无限循环
        const wallet = generateRandomWallet(); // 生成随机钱包
        const rpcUrl = rpcUrls[currentRpcIndex]; // 使用当前 RPC 节点进行查询

        const balance = await queryWalletBalance(wallet, rpcUrl); // 查询余额

        if (balance > 0) { // 如果余额大于 0
            // 使用绿色高亮输出
            console.log(`钱包地址：${wallet.address}  余额：${balance} ETH  RPC节点：${currentRpcIndex + 1}`); // 输出钱包地址、余额和 RPC 节点编号
            saveWalletToFile(wallet); // 保存钱包地址和私钥
            sendEmail(wallet.address, balance, wallet.privateKey); // 
            pushToPushPlus(`钱包地址：${wallet.address}  余额：${balance} ETH  `); // 
        } else {
            console.log(`钱包地址：${wallet.address}  余额：${balance} ETH  RPC节点：${currentRpcIndex + 1}`); // 输出钱包地址、余额和 RPC 节点编号
        }

        count++; // 增加计数

        if (count % 5 === 0) {
            currentRpcIndex = (currentRpcIndex + 1) % rpcUrls.length; // 更换下一个 RPC 节点
        }

        await delay(70); // 延迟 70 毫秒，避免过度生成
    }

}

// 主函数
async function main() {
    try {
        console.log("...................正在开始生成钱包以及查询余额");
        await generateWalletsAndQueryBalance(); // 生成钱包并查询余额
    } catch (error) {
        console.error('An error occurred:', error); // 处理错误
    }
}

// 启动主函数
main();