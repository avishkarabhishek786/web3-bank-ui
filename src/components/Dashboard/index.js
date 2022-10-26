import React, { useState } from 'react';

const Dashboard = () => {

    return (
        <>
            <div className="card">
                <div className="card-header">
                    Collateral Status
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">ETH: 2000</li>
                    <li className="list-group-item">BTC: 388</li>
                    <li className="list-group-item">INR: 2000000</li>
                </ul>
            </div>

            <div className="card">
                <div className="card-header">
                    Loan Distributed Status
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">ETH: 2000</li>
                    <li className="list-group-item">BTC: 388</li>
                    <li className="list-group-item">INR: 2000000</li>
                </ul>
            </div>

            <div className="card">
                <div className="card-header">
                    Mortgage Status
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">ETH: 2000</li>
                    <li className="list-group-item">BTC: 388</li>
                    <li className="list-group-item">INR: 2000000</li>
                </ul>
            </div>
        </>
    )

    // return (

    //     <div className="card">
    //         <div className="card-body">
    //             <h5 className="card-title">Lender's Dashboard</h5>
    //         </div>
    //         <span>Collateral Balance:</span>
    //         <ul className="list-group list-group-flush">
    //             {
    //                 lendersColl.map((m,i)=>{
    //                     <li className="list-group-item">{m.token}:{m.value} </li>
    //                 })
    //             }
    //         </ul>
    //         <span>Assets Lent:</span>
    //         <ul className="list-group list-group-flush">
    //             {
    //                 lendersLentLoan.map(m=>{
    //                     <li className="list-group-item">{m.token}:{m.value} </li>
    //                 })
    //             }
    //         </ul>
    //         <span>Awaiting Mortgage:</span>
    //         <ul className="list-group list-group-flush">
    //             {
    //                 lendersMortgage.map(m=>{
    //                     <li className="list-group-item">{m.token}:{m.value} </li>
    //                 })
    //             }
    //         </ul>
    //     </div>
    // ) 
}

export default Dashboard;

