import { Contract, utils } from "ethers";
import {
    TOKEN_CONTRACT_ABI,
    TOKEN_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS
} from "../constants";

/**
 * addLiquidity: adds liquidity to the exchange
 */
export const addLiquidity = async (
    signer,
    amountOfCDTokenWei,
    amountOfEthWei,
) => {
    try {
        // create an instance of exchange contract
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
        );

        // create an instance of token contract
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ABI,
            TOKEN_CONTRACT_ADDRESS,
            signer
        );

        // allow the exchange contract to spend CD tokens on behalf of the 'signer' from the token Contract
        const tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            amountOfCDTokenWei.toString()
        );
        await tx.wait();

        // after approval, we need to pass CD and eth amounts to add Liquidity
        tx = await exchangeContract.addLiquidity(amountOfCDTokenWei, {
            value: amountOfEthWei
        })
        await tx.wait();

    } catch (err) {
        console.error(err);
    }
}

/**
 * calculateCD: calculates the num of CD tokens that can be added to the contract for a given Eth amount
 */
export const calculateCD = async (
    _addEther = '0',
    etherBalanceContract,
    cdTokenReserve
) => {
    try {
        // '_addEther' is a string, so it needs to be converted into a BigNumber using 'parseEther'
        const _addEtherAmountWei = utils.parseEther(_addEther);

        const cryptoDevTokenAmount = _addEtherAmountWei
            .mul(cdTokenReserve)
            .div(etherBalanceContract);
        return cryptoDevTokenAmount;
    } catch (err) {
        console.error(err);
    }
}