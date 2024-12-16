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
        document.getElementById('add_liquidity').style.display = 'block';
        document.getElementById('remove_liquidity').style.display = 'block';
        document.getElementById('swap_a_b').style.display = 'block';
        document.getElementById('swap_b_a').style.display = 'block';
        
        document.getElementById('getPrice').style.display = 'block';
        document.getElementById('owner').style.display = 'block';
        document.getElementById('reserveA').style.display = 'block';
        document.getElementById('reserveB').style.display = 'block';
        document.getElementById('tokenA').style.display = 'block';
        document.getElementById('tokenB').style.display = 'block';

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
    document.getElementById('add_liquidity').style.display = 'none';
    document.getElementById('remove_liquidity').style.display = 'none';
    document.getElementById('swap_a_b').style.display = 'none';
    document.getElementById('swap_b_a').style.display = 'none';
    document.getElementById('getPrice').style.display = 'none';
    document.getElementById('owner').style.display = 'none';
    document.getElementById('reserveA').style.display = 'none';
    document.getElementById('reserveB').style.display = 'none';
    document.getElementById('tokenA').style.display = 'none';
    document.getElementById('tokenB').style.display = 'none';
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


document.getElementById('btn_sendLiquidity').addEventListener('click', sendLiquidity);
document.getElementById('btn_removeLiquidity').addEventListener('click', removeLiquidity);
document.getElementById('btn_swapA_B').addEventListener('click', swapAB);
document.getElementById('btn_swapB_A').addEventListener('click', swapBA);
document.getElementById('btn_getPrice').addEventListener('click', getPrice);
document.getElementById('btn_owner').addEventListener('click', getOwner);
document.getElementById('btn_reserveA').addEventListener('click', reserveA);
document.getElementById('btn_reserveB').addEventListener('click', reserveB);
document.getElementById('btn_tokenA').addEventListener('click', tokenA);
document.getElementById('btn_tokenB').addEventListener('click', tokenB);

async function sendLiquidity() {
    if(document.getElementById('btn_sendLiquidity').value!==''){
        alert('Boton enviar liquidacion presionado!')
        console.log('Boton enviar liquidacion presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}
async function removeLiquidity() {
    if(document.getElementById('btn_removeLiquidity').value!==''){
        alert('Boton remover liquidacion presionado!')
        console.log('Boton remover liquidacion presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}
async function swapAB() {
    if(document.getElementById('btn_swapA_B').value!==''){
        alert('Boton intercambiar A hacia B presionado!')
        console.log('Boton intercambiar A hacia B presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}
async function swapBA() {
    if(document.getElementById('btn_swapB_A').value!==''){
        alert('Boton intercambiar B hacia A presionado!')
        console.log('Boton intercambiar B hacia A presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}
async function getPrice() {
    if(document.getElementById('btn_getPrice').value!==''){
        alert('Boton obtener precio presionado!')
        console.log('Boton obtener precio presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}
async function getOwner() {
    if(document.getElementById('btn_owner').value!==''){
        alert('Boton obtener dueño presionado!')
        console.log('Boton obtener dueño presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}
async function reserveA() {
    if(document.getElementById('btn_reserveA').value!==''){
        alert('Boton reservar A presionado!')
        console.log('Boton reservar A presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}
async function reserveB() {
    if(document.getElementById('btn_reserveB').value!==''){
        alert('Boton reservar B presionado!')
        console.log('Boton reservar B presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}
async function tokenA() {
    if(document.getElementById('btn_tokenA').value!==''){
        alert('Boton token A presionado!')
        console.log('Boton token A presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}
async function tokenB() {
    if(document.getElementById('btn_tokenB').value!==''){
        alert('Boton token B presionado!')
        console.log('Boton token B presionado!')
    } else {
        alert('El campo no puede estar vacio')
    }
}