import { Contract } from "ethers";
import {
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS
} from "../constants";

/**
 * getAmountOfTokensReceivedFromSwap:
 */
export const getAmountOfTokensReceivedFromSwap = async (
    _swapAmountWei,
    provider,
    ethSelected,
    ethBalance,
    reserveCD
) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ABI,
            EXCHANGE_CONTRACT_ADDRESS,
            provider
        );
        let amountOfTokens;
        if (ethSelected) {
            amountOfTokens = await exchangeContract.ethToCryptoDevToken(
                _swapAmountWei,
                ethBalance,
                reserveCD
            );
        } else {
            amountOfTokens = await exchangeContract.cryptoDevTokenToEth(
                _swapAmountWei,
                reserveCD,
                ethBalance
            );
        }
        return amountOfTokens;

    } catch (err) {
        console.error(err);
    }
}

/**
 * swapTokens: swaps 'swapAmountWei' of eth/CD with 'tokenToBeReceivedAfterSwap'  CD/eth
 */
export const swapTokens = async (
    signer,
    swapAmountWei,
    tokenToBeReceivedAfterSwap,
    ethSelected
) => {
    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ABI,
        EXCHANGE_CONTRACT_ADDRESS,
        signer
    );
    const tokenContract = new Contract(
        TOKEN_CONTRACT_ABI,
        TOKEN_CONTRACT_ADDRESS,
        signer
    );
    let tx;

    if (ethSelected) {
        tx = await exchangeContract.ethToCryptoDevToken(
            tokenToBeReceivedAfterSwap,
            {
                value: swapAmountWei,
            }
        );
    } else {
        tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            tokenToBeReceivedAfterSwap
        );
        await tx.wait();

        tx = await exchangeContract.cryptoDevTokenToEth(
            swapAmountWei,
            tokenToBeReceivedAfterSwap
        );
    }
    await tx.wait();
}