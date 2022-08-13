import { Contract } from "ethers"
import {
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS
} from "../constants";

/**
 * getEtherBalance: retrieves the eth balance of the user or the contract
 */
export const getEtherBalance = async (
    provider,
    address,
    contract = false
) => {
    try {
        // if contract is false, get the balance of user address otherwise get the balance of contract
        if (!contract) {
            const balance = await provider.getBalance(address);
            return balance;
        } else {
            const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
            return balance;
        }
    } catch (err) {
        console.error(err);
        return 0;
    }
}


/**
 * getCDTokensBalance: retrieves the no.of CD tokens of the given address
 */
export const getCDTokensBalance = async (provider, address) => {
    try {
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            provider
        );
        const cryptoDevTokenBalance = await tokenContract.balanceOf(address);
        return cryptoDevTokenBalance;
    } catch (err) {
        console.error(err);
    }
}

/**
 * getLPTokensBalance: retrieves the no. of LP tokens in the account of the given address
 */
export const getLPTokensBalance = async (provider, address) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        const balanceOfLPTokens = await exchangeContract.balanceOf(address);
        return balanceOfLPTokens;

    } catch (err) {
        console.error(err);
    }
}

/**
 * getReserveOfCDTokens: retrieves the amount of CD tokens in the contract address
 */
export const getReserveOfCDTokens = async (provider) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        const reserveOfCDToken = await exchangeContract.getReserve();
        return reserveOfCDToken;
    } catch (err) {
        console.error(err);
    }
}