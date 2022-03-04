import React, {useEffect, useState} from 'react';
import { ethers } from 'ethers';
import sea from '../assets/sea.png';

import {useWeb3React} from '@web3-react/core';
import {injected} from 'InjectedConnector';

import seaTokenAddress from '../contracts/seatoken-address.json';
import seaTokenContract from '../contracts/Seatoken.json';
import icoAddress from '../contracts/ico-address.json';
import icoContract from '../contracts/ICO.json';

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Transfer } from "./Transfer";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";

const HARDHAT_NETWORK_ID = '31337';
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export function Dapp() {

  const[currentAccount, setCurrentAccount] = useState('');
  // connect wallet, wallet connected, wrong network
  const [walletStatus, setWalletStatus] = useState('Connect wallet');
  const [balance, setBalance] = useState('');
  const [amount, setAmount] = useState();
  const [receiver, setReceiver] = useState();
  const [events, setEvents] = useState(['aaaa', 'bbbb']);
  //const [provider, setProvider] = useState();
  //const [signer, setSigner] = useState();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const seaToken = new ethers.Contract(seaTokenAddress.Token, seaTokenContract.abi, signer);
  
  seaToken.on('Transfer', async (sender, to, amount) => {
    //const e = [...events];
    //e.push(`${amount} SEA tokens sent from ${sender} to ${to}`);
    setEvents([...events, `${amount} SEA tokens sent from ${sender} to ${to}`]);
  })

  async function checkWalletIsConnected() {
    if(!window.ethereum) {
      console.log('No Metamask wallet detected');
    } else {
      console.log('Metamask wallet detected');
    }

    const accounts = await window.ethereum.request({method: 'eth_accounts'});

    if(window.ethereum.networkVersion == '3') {
      console.log('Network: Ropsten');
      if(accounts.length !== 0) {
        const account = accounts[0];
        console.log('Account address', account, 'already connected');
        setCurrentAccount(account);
        setWalletStatus('Wallet Connected');
      } else {
        console.log('No account found');
        setWalletStatus('Connect Wallet');
      }
    } else {
      console.log('Wrong Network');
      setWalletStatus('Wrong Network');
    }
  }

  async function connectWalletHandler() {
    if(!window.ethereum) {
      alert('Please install Metamask!');
    }
    try {
      if(walletStatus === 'Connect Wallet') {
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
        console.log('Account address: ', accounts[0]);
        setCurrentAccount(accounts[0]);
        setWalletStatus('Wallet Connected');
        
        //await getBalance();
      } else if(walletStatus === 'Wrong Network') {
        try {
          await window.ethereum.request({method: 'wallet_switchEthereumChain', params: [{chainId: '0x3'}]});
            setWalletStatus('Connect Wallet');
        } catch(err) {
          if(err === 4902) {
            try {
              await window.ethereum.request({method: 'wallet_addEthereumChain', params: [
                {
                  chainId: '0x7A69',
                  chainName: 'Local',
                  rpcUrls: 'http://localhost:8545'
                }]});
            } catch(err) {
              console.log(err);
            }
          }
        }
      }
    } catch(err) {
      console.log(err);
    }
  }

  async function getBalance() {
    if(window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      //const signer = provider.getSigner();
      const seaToken = new ethers.Contract(seaTokenAddress.Token, seaTokenContract.abi, provider);
      const balance = await seaToken.balanceOf(currentAccount);
      setBalance(balance);
      console.log(balance.toString());
    }
  }

  async function transferTokens() {
    console.log(amount);
    console.log(receiver);
    if(window.ethereum) {
      //await window.ethereum.request({method: 'eth_requestAccounts'});
      
      const transaction = await seaToken.transfer(receiver, amount);
      await transaction.wait();
      //const e = [...events];
      //e.push(transaction.hash);
      //setEvents(e);
      //console.log(events);
    }
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  window.ethereum.on("accountsChanged", ([newAddress]) => {
    console.log('Account changed to ', newAddress);
    checkWalletIsConnected().wait();
    getBalance();
  });

  return(
    <div className='container'>
      <h1>Sea Token Crowd Sale</h1>
        <div className='connect-container'>
          <button onClick={connectWalletHandler}>
            {walletStatus === 'Wallet Connected' ? currentAccount.slice(0, 6) + '...' + currentAccount.slice(38, 42): walletStatus}
          </button>
          <button onClick={getBalance}>Get Balance</button>
        </div>
        <br />
        <div className='transfer-container'>
          <div>Transfer</div>
          <input id='amountInput' onChange={e => setAmount(e.target.value)} placeholder='Amount'></input>
          <input id='receiverInput' onChange={e => setReceiver(e.target.value)} placeholder='Receiving Address'></input>
          <button onClick={transferTokens}>Transfer</button>
        </div>
        <div className='info-container'>
          <div>SEA balance: {balance.toString()}</div>
          <div className='event-container'>
            <div>Events:</div>
            <div>
              <ul>
            {events.map((event, i) => {
              return <li key={i}>{event}</li>
            })}
            </ul>
            </div>
          </div>
        </div>
      </div>
  );
}

/*export function Dapp() {
  const [userAddress, setUserAddress] = useState();
  const [balance, setBalance] = useState();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const seaToken = new ethers.Contract(seaTokenAddress.Token, seaTokenContract.abi, provider);
  const ico = new ethers.Contract(icoAddress.ICO, icoContract.abi, provider);

  console.log(seaTokenAddress.Token);
  
  useEffect(() => {
    requestAccount();
  }, [userAddress]);

  async function requestAccount() {
    const [account] = await window.ethereum.request({method: 'eth_requestAccounts'});
    setUserAddress(account);
  }

  async function connectWallet() {
    //const [address] = await window.ethereum.request({method: 'eth_requestAccounts'});
    //const provider = new ethers.providers.Web3Provider(window.ethereum);
    //const signer = provider.getSigner();
    //const contract = new ethers.Contract(seaTokenAddress.Token, seaTokenContract.abi, signer);
    //setUserAddress(address);
    //setProvider(provider);
    //setContract(contract);
    //await getBalance();
  }


  window.ethereum.on("accountsChanged", () => {
    requestAccount();
  });

  async function disconnectWallet() {
    setUserAddress(null);
    setBalance(null);
  }

  async function getBalance() {
    if(typeof window.ethereum !== 'undefined') {
      //const [account] = await window.ethereum.request({method: 'eth_requestAccounts'});
      
      const newBalance = await seaToken.balanceOf(userAddress);
      console.log('Balance: ', newBalance.toString());
      setBalance(newBalance);
    }
  }

  return(
    <div className='container'>
      <button onClick={requestAccount}>Connect Wallet</button>
      <button onClick={disconnectWallet}>Disconnect</button>
      <div>Address: {userAddress.toString()}</div>
      <button onClick={getBalance}>Get Balance</button>
      <div>Account Balance: {balance.toString()}</div>
    </div>
  );
}*/
























/*export class Dapp extends React.Component {
	constructor(props) {
		super(props);
		this.initialState = {
			// The info of the token (i.e. It's Name and symbol)
      		tokenData: undefined,
      		// The user's address and balance
      		selectedAddress: undefined,
      		balance: undefined,
      		// The ID about transactions being sent, and any possible error with them
      		txBeingSent: undefined,
      		transactionError: undefined,
      		networkError: undefined
		}
		this.state = this.initialState;
	}

	render() {
		if (window.ethereum === undefined) {
      		return <NoWalletDetected />;
    	}


    	if (!this.state.selectedAddress) {
      		return (
        		<ConnectWallet 
          		connectWallet={() => this._connectWallet()} 
          		networkError={this.state.networkError}
          		dismiss={() => this._dismissNetworkError()}
        		/>
      		);
    	}

    	if (!this.state.tokenData || !this.state.balance) {
      		return <Loading />;
    	}

		return(
			<div>
				<div className = 'bgimage'>
				<h1>Sea Token Crowd Sale</h1>
				<div className = 'info'>
				<h2>
              		{this.state.tokenData.name} ({this.state.tokenData.symbol})
            	</h2>
            	<div className='balance'>
	            <p>
	              Welcome <b>{this.state.selectedAddress}</b>, you have{" "}
	              <b>
	                {this.state.balance.toString()} {this.state.tokenData.symbol}
	              </b>
	              .
	            </p>
	            </div>

	            <hr />

	            <div className="col-12">
		            {this.state.txBeingSent && (
		              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
		            )}

		            {this.state.transactionError && (
		              <TransactionErrorMessage
		                message={this._getRpcErrorMessage(this.state.transactionError)}
		                dismiss={() => this._dismissTransactionError()}
		              />
		            )}
          		</div>
          		<div className="col-12">
            		{this.state.balance.eq(0) && (
              			<NoTokensMessage selectedAddress={this.state.selectedAddress} />
            		)}
            		{this.state.balance.gt(0) && (
              			<Transfer
                			transferTokens={(to, amount) =>
                  			this._transferTokens(to, amount)
                			}
                			tokenSymbol={this.state.tokenData.symbol}
              			/>
            		)}
            		</div>
          		</div>
          		</div>
			</div>
			)
	}

	componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable();

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this._resetState();
      }
      
      this._initialize(newAddress);
    });
    
    // We reset the dapp state if the network is changed
    window.ethereum.on("networkChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
    this._getTokenData();
    this._startPollingData();
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      seaTokenAddress.Token,
      seaTokenContract.abi,
      this._provider.getSigner(0)
    );
  }

  // The next two methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();

    this.setState({ tokenData: { name, symbol } });
  }

  async _updateBalance() {
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    this.setState({ balance });
  }

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _transferTokens(to, amount) {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    // This method handles all of those things, so keep reading to learn how to
    // do it.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._token.transfer(to, amount);
      this.setState({ txBeingSent: tx.hash });

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        throw new Error("Transaction failed");
      }

      // If we got here, the transaction was successful, so you may want to
      // update your state. Here, we update the user's balance.
      await this._updateBalance();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545 
  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {
      return true;
    }

    this.setState({ 
      networkError: 'Please connect Metamask to Localhost:8545'
    });

    return false;
  }
}*/