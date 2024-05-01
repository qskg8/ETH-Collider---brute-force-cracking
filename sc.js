const fs = require('fs'); // 用于操作文件系统
const ethers = require('ethers'); // 以太坊库

// 生成随机以太坊钱包
function generateRandomWallet() {
    const wallet = ethers.Wallet.createRandom(); // 生成随机钱包
    return { address: wallet.address, privateKey: wallet.privateKey }; // 返回地址和私钥
}

// 保存钱包地址和私钥到文件
function saveWalletToFile(wallet) {
    const data = `${wallet.address},${wallet.privateKey}\n`; // 保存地址和私钥
    fs.appendFileSync('1.txt', data, 'utf8'); // 写入文件
}

// 无限循环生成钱包并保存到文件
async function generateInfiniteWallets() {
    let count = 0; // 用于跟踪生成的钱包数量

    while (true) { // 无限循环
        const wallet = generateRandomWallet(); // 生成随机钱包
        saveWalletToFile(wallet); // 保存到文件
        count++; // 增加计数
        console.log(`生成数量 ${count}: 钱包地址 ${wallet.address}`); // 输出钱包地址

        // 添加延迟以避免过度生成
        await new Promise((resolve) => setTimeout(resolve, 50)); // 100 毫秒的延迟
    }
}

// 主函数
async function main() {
    try {
        await generateInfiniteWallets(); // 开始无限生成钱包
    } catch (error) {
        console.error('An error occurred:', error); // 处理错误
    }
}

// 运行主函数
main();