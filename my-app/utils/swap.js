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
    reservedCD
) => {
    try {
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        let amountOfTokens = 0;
        if (ethSelected) {
            console.log("para:");

            console.log("amount of tokens: ", amountOfTokens);
            amountOfTokens = await exchangeContract.getAmountOfTokens(
                _swapAmountWei,
                ethBalance,
                reservedCD
            );
            console.log("sfdfds");
        } else {
            amountOfTokens = await exchangeContract.getAmountOfTokens(
                _swapAmountWei,
                reservedCD,
                ethBalance
            );
        }
        console.log("amountTokens: ", amountOfTokens);
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