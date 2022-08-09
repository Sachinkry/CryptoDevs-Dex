import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { providers, utils, BigNumber } from "ethers";
import React, { useState, useRef, useEffect } from 'react';
import Web3Modal from "web3modal";
import { addLiquidity, calculateCD } from "../utils/addLiquidity";
import {
  getCDTokensBalance,
  getEtherBalance,
  getLPTokensBalance,
  getReserveOfCDTokens,
} from "../utils/getAmounts";
import {
  removeLiquidity,
  getTokensAfterRemove
} from '../utils/removeLiquidity';
import {
  swapTokens, getAmountOfTokensReceivedFromSwap
} from "../utils/swap";


export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [renderLiquidityTab, setRenderLiquidityTab] = useState();

  // connect wallet function
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  }
  // 'getProviderOrSigner' to get signer or provider
  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
      const { chainId } = await web3Provider.getNetwork();

      if (chainId !== 4) {
        window.alert("CHANGE TO RINKEBY NETWORK");
        throw new Error("NOT ON RINKEBY NETWORK");
      }

      if (needSigner) {
        const signer = await web3Provider.getSigner();
        return signer;
      }

      return web3Provider;
    } catch (err) {
      console.error(err);
    }
  }
  // useEffect triggered when 'walletConnected' changes
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        providerOptions: {},
        network: "rinkeby",
        disableInjectedProvider: false
      });
      connectWallet();
    }
  }, [walletConnected]);

  // useEffect triggered when clicked on 'liquidity' or 'swap' button i.e when 'selectedTab' changes


  const renderButton = () => {
    if (renderLiquidityTab) {
      return (
        <div>
          liquidity... loading...
        </div>
      )
    } else {
      return (
        <div>
          swap... loading...
        </div>
      )
    }

  }

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href='./favicon.ico' />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to CryptoDev Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; CryptoDevTokens
          </div>
          <div>
            <button
              className={styles.button}
              onClick={() => setRenderLiquidityTab(true)}
            >
              Liquidity
            </button>
            <button
              className={styles.button}
              onClick={() => setRenderLiquidityTab(false)}
            >
              Swap
            </button>
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.img} src="./cryptodev.svg" />
        </div>

      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Sachin
      </footer>
    </div>
  )
}
