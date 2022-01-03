import React, { Component } from "react";
import UselessCoin from "./contracts/UselessCoin.json";
import Crowdsale from "./contracts/Crowdsale.json";
import getWeb3 from "./getWeb3";
import "materialize-css/dist/css/materialize.min.css";
import "./App.css";
class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Crowdsale.networks[networkId];
      const coinNetwork = UselessCoin.networks[networkId];
      const instance = new web3.eth.Contract(
        Crowdsale.abi,
        deployedNetwork && deployedNetwork.address
      );

      const coinInstance = new web3.eth.Contract(
        UselessCoin.abi,
        coinNetwork && coinNetwork.address
      );
      let left = await coinInstance.methods
        .balanceOf(deployedNetwork.address)
        .call();
      left = left / 1000000000000000000;
      this.setState({ left });
      this.setState({ web3, accounts, contract: instance, coinInstance });
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  render() {
    const tokensLeft = async () => {
      let left = await this.state.coinInstance.methods
        .balanceOf("0x31d76E7348C1073A8065e119E88e4be841CeB92d")
        .call();
      left = left / 1000000000000000000;
      this.setState({ left });
    };
    const buy = async (amount) => {
      const { contract, accounts } = this.state;
      await tokensLeft();
      console.log(this.state.left);
      return await contract.methods
        .buyTokens(accounts[0])
        .send({ value: amount, from: accounts[0] });
    };
    if (!this.state.web3) {
      return <div>Please, connect your wallet</div>;
    }
    return (
      <div className="App">
        <div className="main">
          <div className="row">
            <h1>Useless coin sale</h1>
            <form className="col s12">
              <div className="row">
                <div className="input-field col s6">
                  <input
                    id="icon_prefix"
                    type="number"
                    className="validate"
                    ref={(input) => {
                      this.etherAmount = input;
                    }}
                  />
                  <label htmlFor="icon_prefix">Amount</label>
                </div>
                <div
                  className="waves-effect waves-light btn-large"
                  onClick={() => {
                    let amount = this.etherAmount.value;
                    amount = amount * 10 ** 18;
                    buy(amount.toString());
                  }}
                >
                  Buy
                </div>
              </div>
            </form>
            <h2>Tokens left: {this.state.left} / 100000000 USC</h2>
            <div className="progress">
              <div
                className="determinate"
                style={{ width: `${10000000000 / this.state.left}%` }}
              ></div>
            </div>
          </div>
        </div>
        <a href="https://github.com/mrn359/evmosico">
          <img src="./github-logo.png" alt="github"></img>
        </a>
      </div>
    );
  }
}

export default App;
