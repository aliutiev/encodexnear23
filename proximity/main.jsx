const uniswapV2RouterContract = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const tokenDecimals = 18;

const options = [
  { name: "APPLE", price: 5 },
  { name: "BANANA", price: 0 },
];

State.init({
  options: options,
  fruitSelection1: options[0],
  fruitSelection2: options[1],
  feeTier: 0.05,
  showButtons: false,
  priceLow: 0,
  priceHigh: 0,
  web3connectLabel: "Connect Wallet",
});

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
const handleIncrement = () => {
  State.update((prev) => ({ price: prev.price + 1 }));
};

const handleDecrement = () => {
  if (state.price > 0) State.update((prev) => ({ price: prev.price - 1 }));
};

const handleMaxClick = () => {
  console.log("MAX clicked!");
  // Add functionality for max click here
};

const handleApprove = () => {
  console.log("Approve clicked!");
  // Add functionality for approve here
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

const toggleShowButtons = () => {
  State.update({ showButtons: !state.showButtons });
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
      <div>
        <br></br>
      </div>

      <div class="card">
        <div class="card-header">
          <div className="container">
            <div>
              <p>Pools</p>
            </div>
            <div>
              <button class="btn btn-primary m-0 p-1">
                <p>New Position</p>
              </button>
            </div>
          </div>
        </div>

        <div>
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

      <div>
        <br></br>
      </div>

      <div class="card">
        {/* First div */}
        <div class="card-header p-3">
          <div className="container">
            <div>
              <a href="#">←</a>
              <span>Add Liquidity</span>
            </div>
            <div>
              <a href="#">Clear All</a>
              <span>
                <a href="#">⚙️</a>
              </span>
            </div>
          </div>
        </div>

        {/* Second div */}
        <div class="card-body">
          <span>Select Pair</span>
          <div className="container">
            <select
              value={state.fruitSelection1.name}
              onChange={(e) => {
                const selectedOption = state.options.find(
                  (option) => option.name === e.target.value
                );
                State.update({ fruitSelection1: selectedOption });
              }}
            >
              {state.options.map((option) => (
                <option value={option.name} key={option.name}>
                  {option.name}
                </option>
              ))}
            </select>

            <select
              value={state.fruitSelection2.name}
              onChange={(e) => {
                const selectedOption = state.options.find(
                  (opt) => opt.name === e.target.value
                );
                State.update({ fruitSelection2: selectedOption });
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
            <input
              type="text"
              value={state.feeTier}
              placeholder="Fee Tier"
              onChange={(e) => State.update({ feeTier: e.target.value })}
            />
            <button onClick={toggleShowButtons}>Edit</button>
          </div>
          {state.showButtons && (
            <div className="container">
              <button>0.01%</button>
              <button>0.05%</button>
              <button>0.3%</button>
              <button>1%</button>
            </div>
          )}
        </div>

        {/* Third div */}
        <div class="card-body">
          <span>Set Price Range</span>
          <button>Full Range</button>
          <button>{state.fruitSelection1.name}</button>
          <button>{state.fruitSelection2.name}</button>
          <div>
            <span>Price</span>
            <input
              type="number"
              value={state.priceLow}
              onChange={(e) =>
                State.update({ priceLow: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <span>Price</span>
            <input
              type="number"
              value={state.priceLow}
              onChange={(e) =>
                State.update({ priceLow: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <span>Current Price</span>
            <span>
              {state.fruitSelection1.name} per {state.fruitSelection2.name}
            </span>
          </div>
        </div>

        {/* Fourth div */}
        <div class="card-body">
          <span>Deposit Amounts</span>
          <div>
            <input type="text" />
            <span>{state.fruitSelection1.name}</span>
            <span>Balance: 100USD</span>
            <a href="#" onClick={handleMaxClick}>
              MAX
            </a>
          </div>
          <div>
            <input type="text" />
            <span>{state.fruitSelection2.name}</span>
            <span>Balance: 100USD</span>
            <a href="#" onClick={handleMaxClick}>
              MAX
            </a>
          </div>
          <div>
            <p>Estimated Transaction Cost: {state.txCost}</p>
          </div>
        </div>

        {/* Pill button */}
        <div class="card-footer">
          <div className="centered-container">
            <button
              style={{ borderRadius: "20px", width: "300px" }}
              onClick={handleApprove}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
      {/* Third div 
            <div>
                <button>
                    <p>Show closed positions</p>
                </button>
            </div>
            */}
    </div>
    <div class="card m-3">
      <div class="card-header">
        <div className="centered-container">
          <div>
            <p>Add Liquidity</p>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div className="container">
          <div>
            {state.fruitSelection1.name + " / " + state.fruitSelection2.name}
          </div>
          <div>In Range 🟢</div>
        </div>
        <div class="card m-3 p-3">
          <div className="container">
            <div>{state.fruitSelection1.name}</div>
            <div>{state.fruitSelection1.price}</div>
          </div>
          <div className="container">
            <div>{state.fruitSelection2.name}</div>
            <div>{state.fruitSelection2.price}</div>
          </div>
          <br></br>
          <div className="container">
            <div>
              <p>Fee tier</p>
            </div>
            <div>{state.feeTier + "%"}</div>
          </div>
        </div>
        <div className="container p-2 center">
          <div>
            <p>Selected range</p>
          </div>
          <div>
            <button>{state.fruitSelection1.name}</button>
            <button>{state.fruitSelection2.name}</button>
          </div>
        </div>
        <div className="container p-2 center">
          <div>
            <p>Selected range</p>
          </div>
          <div>
            <button>{state.fruitSelection1.name}</button>
            <button>{state.fruitSelection2.name}</button>
          </div>
        </div>
        <div className="container">
          <div class="card m-3 p-3">
            <div className="centered-container">
              <div>
                <p>MIN Price</p>
                {state.fruitSelection1.name}
                {state.fruitSelection1.price}
                {state.fruitSelection1.name +
                  " per " +
                  state.fruitSelection2.name}
                <p>
                  Your position will be 100% composed of{" "}
                  {state.fruitSelection1.name} at this price
                </p>
              </div>
            </div>
          </div>
          <div class="card m-3 p-3">
            <div className="centered-container">
              <div>
                <p>MAX Price</p>
                {state.fruitSelection1.name}
                {state.fruitSelection1.price}
                {state.fruitSelection1.name +
                  " per " +
                  state.fruitSelection2.name}
                <p>
                  Your position will be 100% composed of{" "}
                  {state.fruitSelection1.name} at this price
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="centered-container">
          <div class="card m-3 p-3">
            <div>
              <p>MAX Price</p>
              {state.fruitSelection1.name}
              {state.fruitSelection1.price}
              {state.fruitSelection1.name +
                " per " +
                state.fruitSelection2.name}
              <p>
                Your position will be 100% composed of{" "}
                {state.fruitSelection1.name} at this price
              </p>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div className="centered-container">
            <button
              style={{ borderRadius: "20px", width: "300px" }}
              onClick={handleApprove}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  </Theme>
);
