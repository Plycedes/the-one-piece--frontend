import { ethers } from "./ethers-5.7.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connect-button");
const fundButton = document.getElementById("fund-button");

const balanceText = document.getElementById("balance");
const recentWinnerText = document.getElementById("recent-winner");
const playerCountText = document.getElementById("player-count");

connectButton.onclick = connect;
fundButton.onclick = fund;

console.log(ethers);

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        connectButton.innerHTML = "Connected!";
    } else {
        console.log("No metamask!");
    }
}

updatePage();

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    //const ethAmount = "0.011";
    console.log(`Funding with ${ethAmount}`);

    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        try {
            const transactionResponse = await contract.enterOnePieceRace({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            await updatePage();
            console.log("Done!");
        } catch (exception) {
            console.log(exception);
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);

    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReciept) => {
            console.log(`Completed with ${transactionReciept.confirmations} confirmations`);
            resolve();
        });
    });
}

async function updatePage() {
    console.log("Updating page");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    const balance = await provider.getBalance(contractAddress);
    const recentWinner = await contract.getRecentFinder();
    const playerCount = await contract.getNumOfPlayers();

    balanceText.innerHTML = ethers.utils.formatEther(balance);
    recentWinnerText.innerHTML = recentWinner;
    playerCountText.innerHTML = await playerCount;
}