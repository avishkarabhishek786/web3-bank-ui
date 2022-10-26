import React, { useState, useEffect, useCallback } from "react";
import "./index.css";
import { Dashboard, Faucet, NewVault }  from "./components";
import { 
    AssetManager, 
    PoolManager, 
    VaultLenders,
    VaultBorrowers,
    VaultManager,
    LendingBorrowingOperations,
    TokenFactory,
    Token,
    ChainlinkOracle,
    WrappedEther
 } from "./abi";
import { toWei, toEth } from "./helpers";
import { ethers } from "ethers";

const App = () => {

    const CRYPTO_ASSETS = {
        "ETH": WrappedEther.address
    }

    let [blockchainProvider, setBlockchainProvider] = useState(undefined);
    let [metamask, setMetamask] = useState(undefined);
    let [metamaskNetwork, setMetamaskNetwork] = useState(undefined);
    let [metamaskSigner, setMetamaskSigner] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);

    const [AssetManagerContract, setAssetManagerContract] = useState(undefined);
    const [PoolManagerContract, setPoolManagerContract] = useState(undefined);
    const [VaultLendersContract, setVaultLendersContract] = useState(undefined);
    const [VaultBorrowersContract, setVaultBorrowersContract] = useState(undefined);
    const [VaultManagerContract, setVaultManagerContract] = useState(undefined);
    const [LendingBorrowingOperationsContract, setLendingBorrowingOperationsContract] = useState(undefined);
    const [TokenFactoryContract, setTokenFactoryContract] = useState(undefined);
    const [WrappedEtherContract, setWrappedEtherContract] = useState(undefined);
    const [ChainlinkOracleContract, setChainlinkOracleContract] = useState(undefined);
    
    const [INRToken, setINRToken] = useState(undefined);
    const [INRTokenBalance, setINRTokensBalance] = useState(undefined);

    const [etherBalance, setEtherBalance] = useState(undefined);
    const [wethBalance, setWethBalance] = useState(undefined);

    const [isError, setError] = useState(false);

    let alertMessage;

    const connect = async () => {
        try {
            let provider, network, metamaskProvider, signer, accounts;

            if (typeof window.ethereum !== 'undefined') {
                // Connect to RPC  
                console.log('loadNetwork')
                try {
                    //window.ethereum.enable();
                    //await handleAccountsChanged();
                    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    await handleAccountsChanged(accounts);
                } catch (err) {
                    if (err.code === 4001) {
                        // EIP-1193 userRejectedRequest error
                        // If this happens, the user rejected the connection request.
                        console.log('Please connect to MetaMask.');
                    } else {
                        console.error(err);
                    }
                }

                provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")

                console.log("provider", provider);

                setBlockchainProvider(provider);
                network = await provider.getNetwork()

                console.log("network", network);

                setNetworkId(network.chainId);

                // Connect to Metamask  
                metamaskProvider = new ethers.providers.Web3Provider(window.ethereum)
                setMetamask(metamaskProvider)

                signer = await metamaskProvider.getSigner(accounts[0])
                setMetamaskSigner(signer)

                metamaskNetwork = await metamaskProvider.getNetwork();
                setMetamaskNetwork(metamaskNetwork.chainId);

                if (network.chainId !== metamaskNetwork.chainId) {
                    alert("Your Metamask wallet is not connected to " + network.name);

                    setError("Metamask not connected to RPC network");
                }

            } else setError("Could not connect to any blockchain!!");

            return {
                provider, metamaskProvider, signer,
                network: network.chainId
            }

        } catch (e) {
            console.error(e);
            setError(e);
        }

    }

    const handleAccountsChanged = async (accounts) => {
        if (typeof accounts !== "string" || accounts.length < 1) {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        console.log("t1", accounts);
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            alert('Please connect to MetaMask.');
        } else if (accounts[0] !== loggedInAccount) {
            setAccounts(accounts[0]);
        }
    }

    async function faucet(amount) {

        if(amount<=0) {
            const msg = "Amount must be above 0"
            setError(msg)
            alert(msg);
            return false;
        }

        amount = toWei(amount)
        
        const tx = await INRToken
            .mint(loggedInAccount, amount, 
            {from: loggedInAccount}    
        );

    }

    async function createLendersVault(crypto, amount) {

        if(amount<=100) {
            const msg = "Amount must be above 100"
            setError(msg)
            alert(msg);
            return false;
        }

        amount = toWei(amount)

        const allowance = await INRToken.allowance(loggedInAccount, VaultLendersContract.address)

        if(allowance<=0) {
            await INRToken.approve(VaultLendersContract.address, toWei(1000000000), {from: loggedInAccount});
        }
        
        const tx = await VaultManagerContract
            .createLendersVault(
                crypto, amount, 
                { from: loggedInAccount }
        );

        console.log(tx);

    }

    async function createBorrowersVaultWithEther(amount) {
        
        if(amount<=0.1) {
            const msg = "Amount must be above 100"
            setError(msg)
            alert(msg);
            return false;
        }

        amount = toWei(amount)
        
        const tx = await VaultManagerContract
        .createLendersVault(
            crypto, amount,
            { from: loggedInAccount, value: amount }
        );

        console.log(tx);

    }

    async function lendingBorrowingStats() {
        //const abi = ["event NewLoanLent(uint indexed id, address indexed lender, address indexed lendersAsset, uint lendersAssetAmount, address borrower, address borrowersAsset, uint borrowersAssetAmount)"]
        const events = VaultLendersContract.filters.NewLoanLent(loggedInAccount)

        console.log(events);
    }

    async function borrowingStats() {
        //const abi = ["NewDebt(uint indexed id, address indexed borrower, address indexed borrwersAsset, uint borrwersAssetAmount, uint amountOfLendersAssetBorrowing, address lendersAsset)"]
        const events = VaultBorrowersContract.filters.NewDebt(loggedInAccount)

        console.log(events);
    }

    async function lendersAssetsBalances(AssetManagerContract, VaultLendersContract) {
        console.log(VaultLendersContract);
        const allCryptos = await AssetManagerContract.cryptoList()
        const allFiats = await AssetManagerContract.fiatList()

        const assets = allCryptos.concat(allFiats)

        const colls = []
        const lent = []
        const morgage = []


        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            // let sym = '';
            // if(asset!==WrappedEtherContract.address) {
            //     sym = Token
            // } else if(asset==WrappedEtherContract.address) {

            // }
            let collval = await VaultLendersContract.getVaultCollateral(loggedInAccount, asset)
            colls.push({token:asset, value:ethers.utils.formatEther(collval)}) 

            let lentval = await VaultLendersContract.getVaultLoanedAmount(loggedInAccount, asset)
            lent.push({token:asset, value:ethers.utils.formatEther(lentval)})

            let mortval = await VaultLendersContract.getVaultMortgage(loggedInAccount, asset)
            morgage.push({token:asset, value:ethers.utils.formatEther(mortval)})
        }

        return {colls, lent, morgage}
    }

    async function borrowersAssetsBalances(AssetManagerContract, VaultBorrowersContract) {
        const allCryptos = await AssetManagerContract.cryptoList()
        const allFiats = await AssetManagerContract.fiatList()

        const assets = allCryptos.concat(allFiats)

        const colls = []
        const debt = []

        for (let i = 0; i < assets.length; i++) {
            const asset = assets[i];
            // let sym = '';
            // if(asset!==WrappedEtherContract.address) {
            //     sym = Token
            // } else if(asset==WrappedEtherContract.address) {

            // }
            let collval = await VaultBorrowersContract.getVaultCollateral(loggedInAccount, asset)
            colls.push({token:asset, value:ethers.utils.formatEther(collval)}) 

            let debtval = await VaultBorrowersContract.getVaultLoanedAmount(loggedInAccount, asset)
            debt.push({token:asset, value:ethers.utils.formatEther(debtval)})
        }

        return {colls, debt}
    }

    

    useEffect(() => {
        const init = async () => {

            const { provider, metamaskProvider, signer, network } = await connect();

            const accounts = await metamaskProvider.listAccounts();
            setAccounts(accounts[0]);

            if (typeof accounts[0] == "string") {
                setEtherBalance(ethers.utils.formatEther(
                    (await metamaskProvider.getBalance(accounts[0])).toString()
                ));
            }

            const AssetManagerContract = new ethers.Contract(
                AssetManager.address[network],
                AssetManager.abi,
                signer
            )

            setAssetManagerContract(AssetManagerContract);

            const PoolManagerContract = new ethers.Contract(
                PoolManager.address[network],
                PoolManager.abi,
                signer
            )

            setPoolManagerContract(PoolManagerContract);

            const VaultLendersContract = new ethers.Contract(
                VaultLenders.address[network],
                VaultLenders.abi,
                signer
            )

            setVaultLendersContract(VaultLendersContract);

            const VaultBorrowersContract = new ethers.Contract(
                VaultBorrowers.address[network],
                VaultBorrowers.abi,
                signer
            )

            setVaultBorrowersContract(VaultBorrowersContract);

            const VaultManagerContract = new ethers.Contract(
                VaultManager.address[network],
                VaultManager.abi,
                signer
            )

            setVaultManagerContract(VaultManagerContract);

            const LendingBorrowingOperationsContract = new ethers.Contract(
                LendingBorrowingOperations.address[network],
                LendingBorrowingOperations.abi,
                signer
            )

            setLendingBorrowingOperationsContract(LendingBorrowingOperationsContract);

            const TokenFactoryContract = new ethers.Contract(
                TokenFactory.address[network],
                TokenFactory.abi,
                signer
            )

            setTokenFactoryContract(TokenFactoryContract);

            const ChainlinkOracleContract = new ethers.Contract(
                ChainlinkOracle.address[network],
                ChainlinkOracle.abi,
                signer
            )

            setChainlinkOracleContract(ChainlinkOracleContract);

            const WrappedEtherContract = new ethers.Contract(
                WrappedEther.address[network],
                WrappedEther.abi,
                signer
            )

            setWrappedEtherContract(WrappedEtherContract);

            // Set wethBalance 
            const wethBalance = await WrappedEtherContract.balanceOf(accounts[0]);
            setWethBalance(Number(ethers.utils.formatEther(String(wethBalance))));

            //const INRTokenAddr = await TokenFactoryContract.getTokenData("INR");
            const inrToken = new ethers.Contract(
                Token.address[network],
                Token.abi,
                signer
            )
            setINRToken(inrToken);

            // Set INR tokens balance
            const inrTokenBalance = await inrToken.balanceOf(accounts[0]);
            setINRTokensBalance(Number(ethers.utils.formatEther(String(inrTokenBalance))));

        }

        init();

        window.ethereum.on('accountsChanged', handleAccountsChanged);

        window.ethereum.on('chainChanged', function (networkId) {
            // Time to reload your interface with the new networkId
            //window.location.reload();
            unsetStates();
        })

    }, []);

    useEffect(() => {
        (async () => {
            if (typeof metamask == 'object' && typeof metamask.getBalance == 'function'
                && typeof loggedInAccount == "string") {
                setEtherBalance(ethers.utils.formatEther(
                    (await metamask.getBalance(loggedInAccount)).toString()
                ));

            }
        })()
    }, [loggedInAccount]);

    const unsetStates = useCallback(() => {
        setBlockchainProvider(undefined);
        setMetamask(undefined);
        setMetamaskNetwork(undefined);
        setMetamaskSigner(undefined);
        setNetworkId(undefined);
        setAccounts(undefined);
        setEtherBalance(undefined);
        setAssetManagerContract(undefined);
        setPoolManagerContract(undefined);
        setVaultLendersContract(undefined);
        setVaultBorrowersContract(undefined);
        setVaultManagerContract(undefined);
        setLendingBorrowingOperationsContract(undefined);
        setTokenFactoryContract(undefined);
        setWrappedEtherContract(undefined);
        setChainlinkOracleContract(undefined);
        setWethBalance(undefined);
        setINRTokensBalance(undefined);
    }, []);

    const isReady = useCallback(() => {

        return (
            typeof blockchainProvider !== 'undefined'
            && typeof metamask !== 'undefined'
            && typeof metamaskNetwork !== 'undefined'
            && typeof metamaskSigner !== 'undefined'
            && typeof networkId !== 'undefined'
            && typeof loggedInAccount !== 'undefined'
            && typeof etherBalance !== 'undefined'
            && typeof AssetManagerContract !== 'undefined'
            && typeof PoolManagerContract !== 'undefined'
            && typeof VaultLendersContract !== 'undefined'
            && typeof VaultBorrowersContract !== 'undefined'
            && typeof VaultManagerContract !== 'undefined'
            && typeof LendingBorrowingOperationsContract !== 'undefined'
            && typeof TokenFactoryContract !== 'undefined'
            && typeof WrappedEtherContract !== 'undefined'
            && typeof ChainlinkOracleContract !== 'undefined'
            && typeof wethBalance !== 'undefined'
            && typeof INRToken !== 'undefined'
            && typeof INRTokenBalance !== 'undefined'
        );
    }, [
        blockchainProvider,
        metamask,
        metamaskNetwork,
        metamaskSigner,
        networkId,
        loggedInAccount,
        etherBalance,
        AssetManagerContract,
        PoolManagerContract,
        VaultLendersContract,
        VaultBorrowersContract,
        VaultManagerContract,
        LendingBorrowingOperationsContract,
        TokenFactoryContract,
        WrappedEtherContract,
        ChainlinkOracleContract,
        wethBalance,
        INRToken,
        INRTokenBalance
    ]);

    if (isError) {
        return (
            <>
                <div className="alert alert-danger" role="alert">{isError}</div>
            </>
        )
    } else if (!isReady()) {
        
        return (<p>Loading...</p>)

    } else {

        return (
            <div className="container">
                <Faucet faucet={faucet} />
                <NewVault 
                    createLendersVault={createLendersVault} 
                    createBorrowersVaultWithEther={createBorrowersVaultWithEther}  
                    cash={INRToken.address}      
                />

                <Dashboard />
                <button className="btn btn-success" onClick={()=>borrowersDashboard()}>Borrowers</button>
            </div>
        );
    }
};

export default App;