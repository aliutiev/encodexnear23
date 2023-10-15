const uniswapV2RouterContract = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const tokenAContractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; //WETH
const tokenBContractAddress = `0xdac17f958d2ee523a2206206994597c13d831ec7`; //USDT
const lptokenaddresss = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"; //usdt weth FINAL

const apiurl =
  "https://api.etherscan.io/api?module=contract&action=getabi&address";
const apikey = "HXXJWINJIBIRGIIUY9Q9FZ2G377BWEEJAK";

const tokenAABI = fetch(`${apiurl}=${tokenAContractAddress}&apikey=${apikey}`);
const tokenBABI = fetch(`${apiurl}=${tokenBContractAddress}&apikey=${apikey}`);
const lpABI = fetch(`${apiurl}=${lptokenaddresss}&apikey=${apikey}`);
const uniswapABI = fetch(
  "https://unpkg.com/@uniswap/v2-periphery@1.1.0-beta.0/build/IUniswapV2Router02.json"
);

let tokenAabi = tokenAABI.body.result;
let tokenBabi = tokenBABI.body.result;
let lpabi = lpABI.body.result;

const tokenDecimalsETH = 18;
const tokenDecimalsUSDT = 6;
const fixedDecimals = 5;

let lpAmountRaw = "0.00000001663";
let lpAmount = ethers.utils
  .parseUnits(lpAmountRaw, tokenDecimalsETH)
  .toHexString();

const options = [
  {
    name: "WETH",
    price: 1561.79,
    maxAmount: 0.001,
    minSlippage: 0.01,
    balance: 0,
    poolBalance: 0,
  },
  {
    name: "USDT",
    price: 0.99986,
    maxAmount: 1.5483,
    minSlippage: 0.01,
    balance: 0,
    poolBalance: 0,
  },
];

const gas = {
  gasPrice: ethers.utils.parseUnits("9", tokenDecimalsETH / 2),
  gasLimit: 250000,
};

State.init({
  options: options,
  coinA: options[0],
  coinB: options[1],
  feeTier: 0.01,
  showButtons: false,
  showAddLiquidity: false,
  showRemoveLiquidity: false,
  web3connectLabel: "Connect Wallet",
  liquidityResult: null,
  liquidityError: null,
  gasPrice: null,
  estimatedGasLimit: null,
  offsetSeconds: 1800,
});

const provider = Ethers.provider();
const uniContract = new ethers.Contract(
  uniswapV2RouterContract,
  uniswapABI.body.abi,
  provider.getSigner()
);
const tokenAcontract = new ethers.Contract(
  tokenAContractAddress,
  tokenAabi,
  provider.getSigner()
);
const tokenBcontract = new ethers.Contract(
  tokenBContractAddress,
  tokenBabi,
  provider.getSigner()
);
const lpTokenContract = new ethers.Contract(
  lptokenaddresss,
  lpabi,
  provider.getSigner()
);

let amountADesired = ethers.utils
  .parseUnits(
    parseFloat(state.coinA.maxAmount).toFixed(fixedDecimals),
    tokenDecimalsETH
  )
  .toHexString();

let amountBDesired = ethers.utils
  .parseUnits(
    parseFloat(state.coinB.maxAmount).toFixed(fixedDecimals + 3),
    tokenDecimalsUSDT
  )
  .toHexString();

let amountAMin = ethers.utils
  .parseUnits(
    parseFloat(state.coinA.maxAmount * (1 - state.coinA.minSlippage)).toFixed(
      fixedDecimals
    ),
    tokenDecimalsETH
  )
  .toHexString();

let amountBMin = ethers.utils
  .parseUnits(
    parseFloat(state.coinB.maxAmount * (1 - state.coinB.minSlippage)).toFixed(
      fixedDecimals
    ),
    tokenDecimalsUSDT
  )
  .toHexString();

const addLiquidityUni = () => {
  let deadline = ethers.BigNumber.from(
    Math.floor(Date.now() / 1000) + 3600
  ).toHexString();

  tokenAcontract
    .approve(uniswapV2RouterContract, amountADesired)
    .then((response) => {
      console.log("response token A GOOD --------", response.hash);
    })
    .catch((error) => {
      console.log("Error A:", error);
    });

  tokenBcontract
    .approve(uniswapV2RouterContract, amountBDesired, gas)
    .then((response) => {
      console.log("response token B GOOD --------", response.hash);
      uniContract
        .addLiquidity(
          tokenAContractAddress,
          tokenBContractAddress,
          amountADesired,
          amountBDesired,
          amountAMin,
          amountBMin,
          state.sender,
          deadline,
          gas
        )
        .then((response) => {
          console.log("response UNI is ", response.hash);
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    })
    .catch((error) => {
      console.log("Error B:", error);
    });
  return;
};

const removeLiquidityUni = () => {
  let deadline = ethers.BigNumber.from(
    Math.floor(Date.now() / 1000) + 3600
  ).toHexString();

  lpTokenContract
    .approve(uniswapV2RouterContract, lpAmount)
    .then((response) => {
      console.log("lp token approve GOOD --------", response);
      uniContract
        .removeLiquidity(
          tokenAContractAddress,
          tokenBContractAddress,
          lpAmount,
          amountAMin,
          amountBMin,
          state.sender,
          deadline
        )
        .then((response) => {
          console.log("lp token remove request --------", response);
        })
        .catch((error) => {
          console.log("Error A:", error);
        });
    })
    .catch((error) => {
      console.log("Error lp token:", error);
    });

  return;
};

if (!state.theme) {
  State.update({
    theme: styled.div`
        font-family: Manrope, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        ${cssFont}
        ${css}

        .container {
            display: flex;
            justify-content: space-between; 
            align-items: center;
            margin-bottom: 10px;
          }

          .centered-container {
            display: flex;
            justify-content: center; /* Centers horizontally */
            align-items: center;     /* Centers vertically */
            margin-top: 10px;
            margin-bottom: 10px;
          }
          
    `,
  });
}

const Theme = state.theme;
const web3connectLabel = state.web3connectLabel || "n/a";

// FRONT END CONTROLS
const handleMaxClick = () => {
  console.log("MAX clicked!");
  // Add functionality for max click here
};

const updateOptionPrice = (name, newPrice) => {
  const updatedOptions = state.options.map((option) => {
    if (option.name === name) {
      return { ...option, price: newPrice };
    }
    return option;
  });
  State.update({ options: updatedOptions });
};

//TOGGLES
const toggleShowButtons = () => {
  State.update({ showButtons: !state.showButtons });
};

const toggleAddLiquidity = () => {
  State.update({ showAddLiquidity: !state.showAddLiquidity });
};
const toggleRemoveLiquidity = () => {
  State.update({ showRemoveLiquidity: !state.showRemoveLiquidity });
};

const clearAll = () => {
  State.update({
    showAddLiquidity: !state.showAddLiquidity,
  });
};

// HELPER FUNCTIONS/STATE
if (state.txCost === undefined) {
  const gasEstimate = ethers.BigNumber.from(1875000);
  const gasPrice = ethers.BigNumber.from(1500000000);

  const gasCostInWei = gasEstimate.mul(gasPrice);
  const gasCostInEth = ethers.utils.formatEther(gasCostInWei);

  let responseGql = fetch(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          bundle(id: "1" ) {
            ethPrice
          }
        }`,
      }),
    }
  );

  if (!responseGql) return "";

  const ethPriceInUsd = responseGql.body.data.bundle.ethPrice;

  const txCost = Number(gasCostInEth) * Number(ethPriceInUsd);

  State.update({ txCost: `$${txCost.toFixed(2)}` });
}

if (state.fExchangeRate === undefined) {
  const gasEstimate = ethers.BigNumber.from(1875000);
  const gasPrice = ethers.BigNumber.from(1500000000);

  const gasCostInWei = gasEstimate.mul(gasPrice);
  const gasCostInEth = ethers.utils.formatEther(gasCostInWei);

  let responseGql = fetch(
    "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `{
          bundle(id: "1" ) {
            ethPrice
          }
        }`,
      }),
    }
  );

  if (!responseGql) return "";

  const ethPriceInUsd = responseGql.body.data.bundle.ethPrice;

  const txCost = Number(gasCostInEth) * Number(ethPriceInUsd);

  State.update({ txCost: `$${txCost.toFixed(2)}` });
}

if (state.sender === undefined) {
  const accounts = Ethers.send("eth_requestAccounts", []);
  if (accounts.length) {
    State.update({ sender: accounts[0] });
    console.log("set sender", accounts[0]);
  }
}

// getters
const getSender = () => {
  return !state.sender
    ? ""
    : state.sender.substring(0, 6) +
    "..." +
    state.sender.substring(state.sender.length - 4, state.sender.length);
};

return (
  <div>
    <Theme>
      <div>
        <div className="container">
          <div></div>
          <div>
            <Widget
              src="a_liutiev.near/widget/button_web3connect"
              props={{ web3connectLabel }}
            />
          </div>
        </div>

        {!state.showAddLiquidity && !state.showRemoveLiquidity && (
          <div class="card">
            <div class="card-header">
              <div className="container">
                <div>
                  <p>Pools</p>
                </div>
                <div>
                  <button
                    class="btn btn-primary m-0 p-1"
                    onClick={toggleRemoveLiquidity}
                  >
                    <p>Show Positions</p>
                  </button>
                  <button
                    class="btn btn-primary m-0 p-1"
                    onClick={toggleAddLiquidity}
                  >
                    <p>New Position</p>
                  </button>
                </div>
              </div>
            </div>

            <div class="card-body">
              <div className="centered-container">
                <div>
                  <p>Your active V3 liquidity positions will appear here.</p>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <div className="centered-container">
                <p>{getSender()}</p>
              </div>
            </div>
          </div>
        )}

        {state.showAddLiquidity && (
          <div class="card">
            {/* First div */}
            <div class="card-header p-3">
              <div className="container">
                <div>
                  <a href="#" onClick={toggleAddLiquidity}>
                    ←
                  </a>
                  <span>Add Liquidity</span>

                </div>
                <div>
                  <a href="#" onClick={clearAll}>
                    Clear All
                  </a>
                  <span>
                    <a href="#">⚙️</a>
                  </span>
                </div>
              </div>
            </div>

            {/* Second div */}
            <div class="card-body">
              <div className="container">
                <span>Select Pair</span>
              </div>
              <div className="container">
                <select
                  value={state.coinA.name}
                  onChange={(e) => {
                    const selectedOption = state.options.find(
                      (option) => option.name === e.target.value
                    );
                    State.update({ coinA: selectedOption });
                  }}
                >
                  {state.options.map((option) => (
                    <option value={option.name} key={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>

                <select
                  value={state.coinB.name}
                  onChange={(e) => {
                    const selectedOption = state.options.find(
                      (opt) => opt.name === e.target.value
                    );
                    State.update({ coinB: selectedOption });
                  }}
                >
                  {state.options
                    .filter((option) => option.name === "banana")
                    .concat(
                      state.options.filter((option) => option.name !== "banana")
                    )
                    .map((option) => (
                      <option value={option.name} key={option.name}>
                        {option.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="container">
                <span class="p-0 m-0 w-50"> Set Slippage (%)</span>

                <div className="container p-0">
                  <input
                    type="text"
                    value={state.feeTier}
                    placeholder="Fee Tier"
                    onChange={(e) => State.update({ feeTier: e.target.value })}
                  />
                  <button onClick={toggleShowButtons}>Edit</button>
                </div>
              </div>
              {state.showButtons && (
                <div className="container">
                  <button onClick={() => State.update({ feeTier: 0.001 })}>
                    0.01%
                  </button>
                  <button onClick={() => State.update({ feeTier: 0.005 })}>
                    0.05%
                  </button>
                  <button onClick={() => State.update({ feeTier: 0.003 })}>
                    0.3%
                  </button>
                  <button onClick={() => State.update({ feeTier: 0.01 })}>
                    1%
                  </button>
                </div>
              )}
            </div>

            {/* Third div */}
            <div class="card-body">
              <div class="container">
                {" "}
                <span>Current Prices</span>
              </div>
              <div class="container">
                <div class="container">
                  <span>
                    {state.coinA.name} per {state.coinB.name}
                  </span>
                </div>
                <input
                  type="number"
                  value={state.coinA.price / state.coinB.price}
                  readOnly
                  style={{ textAlign: "right", paddingLeft: "px" }}
                />
              </div>
              <div class="container">
                <div class="container">
                  <span>
                    {state.coinB.name} per {state.coinA.name}
                  </span>
                </div>
                <input
                  type="number"
                  value={state.coinB.price / state.coinA.price}
                  readOnly
                  style={{ textAlign: "right", paddingLeft: "px" }}
                />
              </div>
            </div>

            {/* Fourth div */}
            <div class="card-body">
              <div class="container">
                <span>Deposit Amounts</span>
              </div>
              <div class="container card p-3">
                <div class="container"><input type="text" /></div>
                <div class="container"><div></div>
                  <div>
                    <span>{state.coinA.name}</span>
                    <span>Balance: {state.coinA.balance}</span>
                    <a href="#" onClick={handleMaxClick}>MAX</a>
                  </div>
                </div>
              </div>
              <div class="container card p-3">
                <div class="container"><input type="text" /></div>
                <div class="container"><div></div>
                  <div>
                    <span>{state.coinB.name}</span>
                    <span>Balance: {state.coinB.balance}</span>
                    <a href="#" onClick={handleMaxClick}>MAX</a>
                  </div>
                </div>
              </div>

              <div class='centered-container'>
                <p>Estimated Transaction Cost: {state.txCost}</p>
              </div>
            </div>

            {/* Pill button */}
            <div class="card-footer">
              <div className="centered-container">
                <button style={{ borderRadius: "20px", width: "300px" }}
                  onClick={addLiquidityUni}>
                  Add Liquidity
                </button>
              </div>
            </div>
          </div>)}


      </div>

      {state.showRemoveLiquidity && (<div class="card m-3">
        <div class="card-header">
          <div className="centered-container">
            <div>
              <a href="#" onClick={toggleRemoveLiquidity}>
                ←
              </a>
              <span>Remove Liquidity</span>
            </div>
          </div>
        </div>

        <div class="card-body p-3">
          <div className="container">
            <div>{state.coinA.name + " / " + state.coinB.name}</div>
            <div>Active Pool 🟢</div>
          </div>
          <div class="card m-3 p-3">
            <div className="container">
              <div>{state.coinA.name}</div>
              <div>{state.coinA.poolBalance}</div>
            </div>
            <div className="container">
              <div>{state.coinB.name}</div>
              <div>{state.coinB.poolBalance}</div>
            </div>
            <br></br>
            <div className="container">
              <div>
                <p>Fee tier</p>
              </div>
              <div>{state.feeTier * 100 + "%"}</div>
            </div>
          </div>

          <div class="card-footer">
            <div className="centered-container">
              <button
                style={{ borderRadius: "20px", width: "300px" }}
                onClick={removeLiquidityUni}
              >
                Remove Liquidity
              </button>
            </div>
          </div>
        </div>
      </div>

      )}

    </Theme>
  </div>
);
