import React, { useState } from 'react';


const Faucet = ({faucet}) => {
    const [faucetAmount, setFaucetAmount] = useState(undefined)    
    return (

        <div className="input-group mb-3">
            <input 
                type="number" 
                class="form-control" 
                placeholder="Enter amount" 
                aria-label="Amount of USD tokens to mint" 
                aria-describedby="button-addon2" 
                onChange={ (e)=> setFaucetAmount(e.target.value) }    
            />
            <button 
                className="btn btn-outline-secondary" 
                type="button" 
                id="button-addon2"
                onClick={()=>faucet(faucetAmount)}
            >
                Mint
            </button>
        </div>
    )
}

export default Faucet;