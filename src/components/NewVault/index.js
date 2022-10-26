import React, { useState } from 'react';

const NewVault = ({createLendersVault, createBorrowersVaultWithEther, cash}) => {

    const [borrowerStartingEthAmount, setBorrowerStartingEthAmount] = useState(undefined)        
    const [lenderStartingCashAmount, setLenderStartingCashAmount] = useState(undefined)        

    return (
        <div className="row">
            <div className="col-sm-6">
              <div className="card text-center">
              <div className="card-header">
                Begin Your Borrower journey
              </div>
                <div className="card-body">
                  <h5 className="card-title">Open New Borrower's Account</h5>
                  <p className="card-text">New borrower account can be opened with Ether as collateral.</p>
                  <div className="input-group mb-3">
                    <span className="input-group-text">ETH</span>
                    <input 
                        type="number" 
                        className="form-control" 
                        aria-label="Amount (to the nearest dollar)" 
                        onChange={(e)=>setBorrowerStartingEthAmount(e.target.value)}
                    />
                    <span className="input-group-text">.00</span>
                  </div>
                  <a href="#" className="btn btn-primary"
                    onClick={()=>createBorrowersVaultWithEther(borrowerStartingEthAmount)}
                  >
                    Open Account
                  </a>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
            <div className="card text-center">
                <div className="card-header">
                    Begin Your Lender journey
                </div>
                <div className="card-body">
                  <h5 className="card-title">Open New Lender's Account</h5>
                  <p className="card-text">New borrower account can be opened with USD tokens as collateral.</p>
                  <div className="input-group mb-3">
                    <span className="input-group-text">$</span>
                    <input
                        type="number" 
                        className="form-control" 
                        aria-label="Amount (to the nearest dollar)" 
                        onChange={(e)=>setLenderStartingCashAmount(e.target.value)}
                        />
                    <span className="input-group-text">.00</span>
                  </div>
                  <a href="#" className="btn btn-primary"
                    onClick={()=>createLendersVault(cash, lenderStartingCashAmount)}
                  >
                    Open Account
                  </a>
                </div>
              </div>
            </div>
          </div>
    )
}

export default NewVault;