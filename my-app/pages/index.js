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
  const zero = BigNumber.from(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();
  const [renderLiquidityTab, setRenderLiquidityTab] = useState();
  const [loading, setLoading] = useState();
  const [swapAmount, setSwapAmount] = useState("");
  const [etherBalance, setEtherBalance] = useState(zero);
  const [reservedCD, setReservedCD] = useState(zero);
  const [cdBalance, setCDBalance] = useState(zero);
  const [lpBalance, setLPBalance] = useState(zero);
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  const [ethSelected, setEthSelected] = useState(true);
  const [tokenToBeReceivedAfterSwap, setTokenToBeReceivedAfterSwap] = useState(zero);
  const [addEther, setAddEther] = useState(zero);
  const [addCDTokens, setAddCDTokens] = useState(zero);
  const [removeEther, setRemoveEther] = useState(zero);
  const [removeCD, setRemoveCD] = useState(zero);
  const [removeLPTokens, setRemoveLPTokens] = useState(zero);


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
        const signer = web3Provider.getSigner();
        return signer;
      }

      return web3Provider;
    } catch (err) {
      console.error(err);
    }
  }

  // get amounts 
  const getAmounts = async () => {
    try {
      console.log("heelo")
      const provider = await getProviderOrSigner(false);
      console.log("prov:", provider)
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      // get amount of eth in the user's account
      const _ethBalance = await getCDTokensBalance(provider, address);
      // get CD token balance of user
      const _cdBalance = await getCDTokensBalance(provider, address);
      // get LP token of the user
      const _lpBalance = await getLPTokensBalance(provider, address);

      // get the amount of "CD tokens" in the 'exchange contract'
      const _reservedCD = await getReserveOfCDTokens(provider);
      console.log("reserveCD:", _reservedCD);
      // get the ether reserves in the exchange contract
      const _ethBalanceContract = await getEtherBalance(provider, null, true);

      setEtherBalance(_ethBalance);
      setCDBalance(_cdBalance);
      setLPBalance(_lpBalance);
      setReservedCD(_reservedCD);
      setEtherBalanceContract(_ethBalanceContract);
    } catch (err) {
      console.error(err);
    }
  }

  // 'swapTokens' function
  const _swapTokens = async () => {
    try {
      const swapAmountWei = utils.pareseEther(swapAmount);
      if (!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await swapTokens(
          signer,
          swapAmountWei,
          tokenToBeReceivedAfterSwap,
          ethSelected
        );
        setLoading(false);

        await getAmounts();
        setSwapAmount("");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // _getAmountOfTokenReceivedFromSwap 
  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try {
      console.log("swapAmount:", _swapAmount);
      const _swapAmountWei = utils.parseEther(_swapAmount.toString());
      console.log(!_swapAmountWei.eq(zero));
      if (!_swapAmountWei.eq(zero)) {
        const provider = await getProviderOrSigner();
        const signer = await getProviderOrSigner(true);
        console.log("swap", provider);

        const _ethBalance = await getEtherBalance(provider, null, true);
        console.log("para val:", ethSelected, _ethBalance, reservedCD)
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          _swapAmountWei,
          provider,
          ethSelected,
          _ethBalance,
          reservedCD
        );

        console.log("lol1:", amountOfTokens);
        setTokenToBeReceivedAfterSwap(amountOfTokens);
      }
      else {
        setTokenToBeReceivedAfterSwap(zero);
        // console.log("lol2:", amountOfTokens);
      }
      getAmounts();

    } catch (err) {
      console.error(err);
    }
  }

  // addLiquidity function 
  const _addLiquidity = async () => {
    try {
      // convert eth entered into Big number
      const addEtherWei = utils.parseEther(addEther.toString());

      if (!addCDTokens.eq(zero) && !addEtherWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await addLiquidity(signer, addCDTokens, addEtherWei);
        setLoading(false);
        setAddCDTokens(zero);
        await getAmounts();
      } else {
        setAddCDTokens(zero);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // _removeLiquidity function
  const _removeLiquidity = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const removeLPTokensWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      await removeLiquidity(signer, removeLPTokensWei);
      setLoading(false);
      await getAmounts();
      setRemoveCD(zero);
      setRemoveEther(zero);

    } catch (err) {
      console.error(err);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    }
  }

  // _getTokensAfterRemove
  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      const removeLPTokensWei = utils.parseEther(_removeLPTokens);
      const _ethBalance = await getEtherBalance(provider, null, true);
      const cryptoDevTokenReserve = await getReserveOfCDTokens(provider);
      const { _removeEther, _removeCD } = await getTokensAfterRemove(
        provider,
        removeLPTokensWei,
        _ethBalance,
        cryptoDevTokenReserve
      );
      setRemoveEther(_removeEther);
      setRemoveCD(_removeCD);
    } catch (err) {
      console.error(err);
    }
  }



  // connect wallet function
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  }

  // useEffect triggered when 'walletConnected' changes
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false
      });
      connectWallet();
      getAmounts();
    }
  }, []);



  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    if (loading) {
      return (
        <div className={styles.description} ><i><b>Loading...</b></i></div>
      )
    }

    if (renderLiquidityTab) {
      return (
        <div >
          <div className={styles.description}>
            You have:
            <br />
            {utils.formatEther(cdBalance)} Crypto Dev Tokens
            <br />
            {utils.formatEther(etherBalance)} ether
            <br />
            {utils.formatEther(lpBalance)} Crypto Dev LP tokens
            <br />
          </div>
          <div >

            {utils.parseEther(reservedCD.toString()).eq(zero) ? (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={(e) => setAddEther(e.target.value || "0")}
                  className={styles.input}
                />

                <input
                  type="number"
                  placeholder="Amount of CryptoDev Token"
                  onChange={(e) => setAddCDTokens(
                    BigNumber.from(utils.parseEther(e.target.value || "0"))
                  )}
                  className={styles.input}
                />
                <button className={styles.button1} onClick={() => {
                  console.log("kem cho");
                  _addLiquidity();
                }} >
                  Add initial Liquidity
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={async (e) => {
                    setAddEther(e.target.value || "0");
                    const _addCDTokens = await calculateCD(
                      e.target.value || "0",
                      etherBalanceContract,
                      reservedCD
                    );
                    setAddCDTokens(_addCDTokens);
                  }}
                />
                <div className={styles.inputDiv}>
                  {`You will need ${utils.formatEther(addCDTokens)} CryptoDev Tokens`}
                </div>
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add Liquidity
                </button>
              </div>
            )}
            <hr />
            <div>
              <p>Remove liquidity by giving LP tokens back:</p>
              <input
                type="number"
                placeholder="Amount of LP Tokens"
                onChange={async (e) => {
                  setRemoveLPTokens(e.target.value || "0");
                  await _getTokensAfterRemove(e.target.value || "0");
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
                {`You will get ${utils.formatEther(removeCD)} Crypto
              Dev Tokens and ${utils.formatEther(removeEther)} Eth`}
              </div>
              <button className={styles.button1} onClick={_removeLiquidity}>Remove liquidity</button>
            </div>

          </div>
        </div >
      )
    } else {
      return (

        <div className={styles.description}>
          <input
            className={styles.input}
            type="number"
            placeholder="Amount"
            onChange={async (e) => {
              setSwapAmount(e.target.value || "");
              // console.log(typeof swapAmount);
              await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
              console.log("SWAP_AMOUNT:", e.target.value);
            }}
            value={swapAmount}
          />
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setEthSelected(!ethSelected);
              // initialize the values back to zero
              await _getAmountOfTokensReceivedFromSwap(zero);
              setSwapAmount("");
            }}
          >
            <option value="eth">Ethereum</option>
            <option value="cryptoDevToken">Crypto Dev Tokens</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {ethSelected ?
              `You will get ${utils.formatEther(tokenToBeReceivedAfterSwap)} CD Tokens in return`
              : `You will get ${utils.formatEther(tokenToBeReceivedAfterSwap)} Eth in return`
            }
          </div>

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
