import { Contract, providers, utils, BigNumber } from "ethers";
import {
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS
} from "../constants"


/**
 * removeLiquidity: removes the liquidity calling removeLiquidity function of exchange contract
 */
export const removeLiquidity = async (signer, removeLPtokensWei) => {
    try {
        // create an instance of exchange contract
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ABI,
            EXCHANGE_CONTRACT_ADDRESS,
            signer
        );
        // call removeLiquidity function using the contract instance
        const tx = await exchangeContract.removeLiquidity(removeLPtokensWei);
        // wait for transaction to complete
        await tx.wait();

    } catch (err) {
        console.error(err);
    }
}

/**
 * getTokensAfterRemove: calculates the amount of Eth or CD tokens the user would get after burining LP tokens
 */
export const getTokensAfterRemove = async (
    provider,
    removeLPtokensWei,
    _ethBalance,
    cryptoDevTokenReserve
) => {
    try {
        // create an instance of exchange contract
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ABI,
            EXCHANGE_CONTRACT_ADDRESS,
            provider
        );

        // get the total supply of LP tokens
        const _totalSupply = await exchangeContract.totalSupply();

        const _removeEther = _ethBalance
            .mul(removeLPtokensWei)
            .div(_totalSupply);

        const _removeCD = cryptoDevTokenReserve
            .mul(removeLPtokensWei)
            .div(_totalSupply);

        return {
            _removeEther,
            _removeCD
        };
    } catch (err) {
        console.error(err);
    }
}