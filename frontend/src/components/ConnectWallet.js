import React from 'react'
import { NetworkErrorMessage } from './NetworkErrorMessage'

export function ConnectWallet({connectWallet, networkError, dismiss}) {
	return(
		<div className='wallet-connect'>
			<div>
				{networkError && (<NetworkErrorMessage message={networkError} dismiss={dismiss}/>)}
			</div>
			<div>
	          <p>Please connect to your wallet.</p>
	          <button
	            className="btn btn-warning"
	            type="button"
	            onClick={connectWallet}
	          >
	            Connect Wallet
	          </button>
	        </div>
        </div>
	);
}