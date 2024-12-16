import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js";

let provider, signer, address, contract;

const TOKEN_ADDRESS = "0xAD614533F1949f36c9D0D6d0C8f02D0c2ea4beB5";

async function loadABI() {
    const response = await fetch('./abi.json');
    const abi = await response.json();
    return abi;
}

async function loadTokenA() {
    const response = await fetch('./tokenA.json');
    const TOKEN_A = await response.json();
    return TOKEN_A;
}

async function loadTokenB() {
    const response = await fetch('./tokenB.json');
    const TOKEN_B = await response.json();
    return TOKEN_B;
}

async function connectWallet() {
    console.log('Connecting wallet...');

    if (window.ethereum) {
        console.log('Metamask detected');

        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        address = await signer.getAddress();
        console.log("🚀 ~ connectWallet ~ address:", address)

        const balance = await provider.getBalance(address)
        const formattedBalance = ethers.formatEther(balance);
        console.log("🚀 ~ connectWallet ~ formattedBalance:", formattedBalance)

        const abi = await loadABI();

        const TOKEN_A = await loadTokenA()

        const TOKEN_B = await loadTokenB()

        contract = new ethers.Contract(TOKEN_ADDRESS, abi, signer, TOKEN_A, TOKEN_B);

        const OWNER = await contract.owner();

        document.getElementById('btnConnect').style.display = 'none';
        document.getElementById('btnDisconnect').style.display = 'inline';

        document.getElementById('status').innerText = `Estado: Conectado a la cuenta ${address}`;
        document.getElementById('erc20Balance').style.display = 'block';
        document.getElementById('ethBalance').style.display = 'block';
        document.getElementById('sendERC20Fields').style.display = 'block';
        document.getElementById('sendETHFields').style.display = 'block';

        document.getElementById('ethBalance').innerText = `Balance de Wallet: ${formattedBalance} ETH`;
    }
    else {
        console.error('Metamask not detected');
    }
}

async function disconnectWallet() {
    provider = null;
    signer = null;
    address = null;

    document.getElementById('status').innerText = "Estado: Desconectado";
    document.getElementById('btnConnect').style.display = 'inline';
    document.getElementById('btnDisconnect').style.display = 'none';
    document.getElementById('sendERC20Fields').style.display = 'none';
    document.getElementById('sendETHFields').style.display = 'none';
    document.getElementById('erc20Balance').style.display = 'none';
    document.getElementById('ethBalance').style.display = 'none';
}

async function sendETH() {
    const recipientAddress = document.getElementById('ethRecipientAddress').value;
    const amount = document.getElementById('ethAmount').value;

    if (!ethers.isAddress(recipientAddress)) {
        alert('Dirección de destinatario inválida');
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert('Monto inválido');
        return;
    }

    try {
        const tx = {
            to: recipientAddress,
            value: ethers.parseEther(amount)
        };

        const txResponse = await signer.sendTransaction(tx);

        await txResponse.wait();

        console.log("🚀 ~ sendETH ~ txResponse", txResponse)
        alert(`Transacción enviada con éxito: ${txResponse.hash}`);

    } catch (error) {
        console.error('Error sending ETH', error);
        alert('Error enviando ETH');
    }

}

async function sendToken() {
    const recipientAddress = document.getElementById('recipientAddress').value;
    const amount = document.getElementById('tokenAmount').value;


    if (!ethers.isAddress(recipientAddress)) {
        alert("Dirección inválida.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Monto inválido.");
        return;
    }

    try {
        const amountToSend = ethers.parseUnits(amount);

        const txApproval = await contract.approve(recipientAddress, amountToSend);
        await txApproval.wait();

        const tx = await contract.transfer(recipientAddress, amountToSend);

        await tx.wait();

        console.log("🚀 ~ sendToken ~ tx", tx)
        alert(`Transacción enviada con éxito: ${tx.hash}`);

    } catch (error) {
        console.error('Error sending ERC20', error);
        alert('Error enviando ERC20');
    }
}

document.getElementById('btnConnect').addEventListener('click', connectWallet);
document.getElementById('btnDisconnect').addEventListener('click', disconnectWallet);
document.getElementById('btnSendETH').addEventListener('click', sendETH);
document.getElementById('btnSendERC20').addEventListener('click', sendToken);