# SpindleASA BUIDL for eth-denver-2022

![Spindle](https://user-images.githubusercontent.com/29375437/159180074-bc4f46df-4c9f-4e6b-b3f5-eae1a861651f.png)

## About Spindle

>Spindle ASA is pioneering experimental fiction on the blockchain using the Algorand ecosystem. Our goal is to provide a platform where authors can experiment with their stories in different ways, such as by adding multimedia elements, audience participation, and unique monetization systems. As different methods are tested and approved by the community, these become templates other authors can use for their own fiction.
>
>We strive to provide options for fiction authors to bypass traditional literary formats and publishing methods, giving them more control over their own narratives. 
>
>As a secondary focus, Spindle has created Warp & Weft, a digital zine publication with ASA news as well as story content spun by the Spindle community.

## YARN Token

This project integrates the usage of YARN, an Algorand Standard Asset (ASA #544217506). Its primary purpose is the interaction within the Spindle community and platform.

## About this BUIDL

Spindle started as a [discord server](https://discord.gg/Wr9AFCdtNr) in January 2022. The first interactions between the community and the Algorand blockchain were conducted manually and the need for automation and easy-to-use interfaces became clear.

The Spindle Team used the opportunity of the ETHDenver 2022 Virtual BUIDLathon to bring some of the goals on the Spindle platform roadmap to life.

#### Timeline
- Jan 2022: Foundation of Spindle and creation of YARN token
- Feb 10, 2022: Official start of the virtual BUIDLathon
- Feb 15, 2022: Start implementation of first Spindle BUIDL [Liquidity Rewards Distributor](#liquidity-rewards-distributor)
- Feb 20, 2022: Start implementation for [Voting Card Swapper](#voting-card-swapper)
- Mar 6, 2022: Start implementation for [Zine Connect](#zine-connect)
- Mar 13, 2022: Start implementation for [Story Voting](#story-voting)
- Mar 14, 2022: Start combining all of the above tools into one common repository
- Mar 18, 2022: Splitting Front-End (this repo) from [Back-End](https://github.com/SpindleASA/spindle-backend)
- Mar 19, 2022: Implementation of [Tipping Authors](#tipping-authors)
- Mar 20, 2022: Finalization

<br />

### Stories
The Spindle BUIDL offers a platform for creative content. The stories that are included on the Spindle BUIDL are written by members of the Spindle ASA Team.

**Crypto Drift** by *Continuity Drift* (https://github.com/continuitydrift/eth-denver-2022)

**Craig!** by *KC Kahre* (https://github.com/Pteratato/Spindle-Stories)

**Witch of Stone** by *Rach* (https://github.com/Rach-toomuchgoogling/Witch-of-Stone)

<br />

### Story Voting

Writers can conduct a poll to determine the progression of the story. This is done using Voting Cards. These are NFTs minted on the Algorand Blockchain with an voting option (A, B, C or D) and a designated YARN value. To vote, readers can use the Wallet Connect feature of this BUIDL to send a Voting Card. The current voting results are read from the Algorand Blockchain.

![Story Voting](https://user-images.githubusercontent.com/29375437/159131991-9279fa68-a9a9-4268-9fc3-5028e68dd515.png)

<br />

### Voting Card Swapper

Readers and writers can use the BUIDL's Voting Card Swapper to swap YARN for Voting Cards or the other way around. 

![Swao MyAlgo Connect](https://user-images.githubusercontent.com/29375437/159132844-190aa1a0-bdc6-436e-8c5d-68f979d3af90.png)

The swap is done using Atomic Transfers, where one transaction is signed by the Spindle Back-End and the other transactions are signed by the user using Wallet Connect.

![Swap Pera Connect](https://user-images.githubusercontent.com/29375437/159133081-2eab9442-e293-4483-adbb-e48e782e0d67.png)

<br />

### Tipping Authors

Using Wallet Connect functionality readers can easily tip YARN to their favorite stories to help promote a continuous flow of exciting content.

![Tipping Authors](https://user-images.githubusercontent.com/29375437/159136838-fe70ceeb-750a-45d9-9f58-cbc43476f9af.png)

<br />

### Zine Connect
Warp & Weft is a digital zine publication with ASA news as well as story content spun by the Spindle community. The Zine Connect of this BUIDL grants access to the PDF publication for holders of NFTs associated to a zine.

![Zine Connect](https://user-images.githubusercontent.com/29375437/159133121-7c0d822c-fe80-490a-b1e3-37e840650d4c.png)

<br />

### Liquidity Rewards Distributor
To incentivize community members to provide liquidity for YARN, Spindle provides its own rewards program. The automation for liquidity rewards distribution is part of this BUIDL. 

![Liquidity Distribution](https://user-images.githubusercontent.com/29375437/159130901-b81be6ed-12ed-4bbf-bcc0-67b2916b166b.png)

All current holders of YARN-ALGO Tinyman LP tokens and their holding history is automatically read from the Algorand Blockchain. Using Wallet Connection for MyAlgo Wallet and Pera Wallet, the Spindle team can easily distribute the rewards.

<br />

### Future Work
Spindle is not done with the end of this BUIDLathon. We plan to offer different monetization options for writers and illustrators that will utilize the Algorand Blockchain and bring more creativity to the whole Algorand Ecosystem.

<br />

### Contact
**Email:** contact@spindle-asa.com

[Github @NanaLean](https://github.com/NanaLean), **NanaLean#6545** (Discord) - Lead Developer

[Github @continuitydrift](https://github.com/continuitydrift), **continuitydrift#1316** (Discord) - Writer and Multimedia Master

[Github @Pteratato](https://github.com/Pteratato), **Pteratato#6575** (Discord) - Writer, Co-Publisher of Warp & Weft and Creator of Spindle

[Github @Rach-toomuchgoogling](https://github.com/Rach-toomuchgoogling), **rach#2348** (Discord) - Writer and Co-Publisher of Warp & Weft

<br />
<br />

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Serve for production
```
npm run start
```
