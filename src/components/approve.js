import React from 'react';
import { inject, observer } from "mobx-react";
  import { Link } from 'react-router-dom';
import { Transaction } from "./Transaction"

@inject("UiStore")
@observer
export class ApproveStep extends React.Component {
  constructor(props){
    super(props);
    this.props = props
    this.txStore = props.UiStore.txStore;
    this.explorerUrl = props.UiStore.web3Store.explorerUrl;
    this.onNext = this.onNext.bind(this)
    this.intervalId = null
    this.state = {
      txs: this.txStore.txs,
    }
  }
  componentDidMount(){
    (async () => {
      try {
        await this.txStore.doApprove()
        this.setState({txs: this.txStore.txs})
      } catch(e){
        console.log('doApprove error:', e)
      }
    })()
    if (null === this.intervalId) {
      this.intervalId = setInterval(() => {
        this.setState({txs: this.txStore.txs})
      }, 1000)
    }
  }

  componentWillUnmount() {
    if (null !== this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  onNext(e) {
    e.preventDefault();
    this.props.history.push('/3')
  }

  render () {
    const { txs } = this.state
    const txHashes = txs.map((tx, index) => {
      return <Transaction key={index} tx={{...tx}} explorerUrl={this.explorerUrl}/>
    })
    const mined = txs.reduce((mined, tx) => {
      const { status } = tx
      return mined && status === "mined"
    }, true)
    let status;
    if(txs.length > 0){
      if (mined) {
        status =  "Approve transaction is mined. Press the Next button to continue"
      } else {
        status = "Approve transaction was sent out. Now wait until it is mined"
      }
    } else {
      status = `Please wait...until you sign transaction in Metamask`
    }
    return (
      <div className="container container_bg">
        <div className="content">
          <h1 className="title"><strong>Welcome to Token</strong> MultiSender</h1>
          <p className="description">
            Please sign an Approve transaction <br />
            This Dapp supports Mainnet, Ropsten, Rinkeby, Kovan, Goerli
          </p>
          <form className="form">
            <p>{status}</p>
            <div className="table">
              {txHashes}
            </div>
            <Link onClick={this.onNext} className="button button_next" to='/3'>Next</Link>
          </form>
        </div>
      </div>
    );
  }
}