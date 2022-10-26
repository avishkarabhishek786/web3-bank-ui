import {ethers} from 'ethers';

export function toWei(x) {
    return String(ethers.utils.parseEther(String(x)));
}

export function toEth(x) {
    return ethers.utils.formatEther(String(x));
}