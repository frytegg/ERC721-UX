  # ERC721 UX Workshop – dApp


  **Tech Stack**
  - **React + TypeScript + Vite**: SPA with React Router.
  - **ethers v6**: Web3 reads/writes via MetaMask.
  - **Netlify**: Static deploy with SPA fallback. Link : https://majestic-strudel-5056f2.netlify.app

  **Contracts (Sepolia)**
  - Fake BAYC: `0x1dA89342716B14602664626CD3482b47D5C2005E`
  - Fake Nefturians: `0x9bAADf70BD9369F54901CF3Ee1b3c63b60F4F0ED`
  - Fake Meebits: `0xD1d148Be044AEB4948B48A03BeA2874871a26003`
  - Fake Meebits Claimer: `0x5341e225Ab4D29B838a813E380c28b0eFD6FBa55`

  The project includes the required ABIs and contract helpers under `src/lib/` and `src/abi/`.

  **Routes**
  - `/chain-info` → Chain details (chainId, latest block, connected address)
  - `/fakeBayc` → Collection info + claim action
  - `/fakeBayc/:tokenId` → Token image + metadata attributes
  - `/fakeNefturians` → Minimum price + buy action (payable)
  - `/fakeNefturians/:userAddress` → Tokens owned by address (name, description, tokenURI)
  - `/fakeMeebits` → Signature-based claim by token ID (availability check + claim)
  - `/wrong-network` → Guidance to switch to Sepolia
  - `*` → Friendly 404

  **What Was Implemented (Workshop Tasks)**
  - Creating a JS app and connecting to Ethereum
    - React + Vite app with ethers v6 and MetaMask connection.
    - `/chain-info` shows chainId, last block number, and user address.
    - Redirects to `/wrong-network` when not on Sepolia.
  - Calling read and write functions
    - `/fakeBayc`: displays name and total supply, claim button to mint a token.
    - `/fakeBayc/:tokenId`: shows image, name, description, and attributes from metadata URI; clean "not found" state.
  - Paying through functions
    - `/fakeNefturians`: displays minimum token price (ETH), buy button sends `msg.value > tokenPrice`.
    - `/fakeNefturians/:userAddress`: lists owned tokens with names, descriptions, and tokenURI.
  - Calling a minter with a signature
    - `/fakeMeebits`: user inputs token ID, checks availability; when "Available", uses signature data to call `claimAToken()` on the Claimer.
  - Bonus: Deploy your static site
    - Deployed on Netlify with SPA fallback.

  All on-chain logic (addresses, ABIs, function calls, and parameter lists) remained unchanged. The refactor focused strictly on presentational UI/UX.

  **UI/UX Enhancements**
  - Consistent design system (CSS variables): colors, spacing, radius, shadows, transitions.
  - Modern App Shell: sticky top nav with app title, route links, current network, and address pill.
  - Components: `Card`, `PageHeader`, `StatCard`, `Button`, `Badge`, `Spinner`, `Alert`, `InputField`, `AddressPill`.
  - Responsive layouts with grid and stack utilities; clean loading and error states.

  **Project Structure (key files)**
  - `src/components/` – Presentational UI components and `GlobalChainContext`.
  - `src/pages/` – Route pages (ChainInfo, FakeBAYC, Token, Nefturians, Meebits, etc.).
  - `src/lib/` – Ethers v6 helpers and contract factories (no logic changes made in this UI pass).
  - `src/index.css` – Theme variables, utilities, and base styles.

  **Run Locally**
  1) Install dependencies
  ```bash
  npm install
  ```
  2) Start dev server
  ```bash
  npm run dev
  ```
  3) Open the local URL printed by Vite, unlock MetaMask, and switch to Sepolia.

  **Build & Preview**
  ```bash
  npm run build
  npm run preview
  ```

  **Deployment (Netlify SPA Fallback)**
  - File `public/_redirects` contains:
  ```
  /*    /index.html   200
  ```
  - Vite copies this into `dist/_redirects` on build so deep links (e.g. `/fakeBayc/123`) resolve to `index.html` and React Router handles the route.

