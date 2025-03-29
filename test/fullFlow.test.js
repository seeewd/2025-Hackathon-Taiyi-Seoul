const { expect } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

describe("Invoice Loan Flow", function () {
  let admin, borrower, lender;
  let invoice, vault, tokenScore, lottery, queue, executor, repayment;

  beforeEach(async function () {
    [admin, borrower, lender] = await ethers.getSigners();
    console.log("👤 admin address:", admin?.address);

    const Invoice = await ethers.getContractFactory("InvoiceNFT");
    invoice = await Invoice.deploy(admin.address);
    console.log("👤 1");
    const TokenScore = await ethers.getContractFactory("TokenScore");
    tokenScore = await TokenScore.deploy(admin.address);
    await tokenScore.deployed(); 
    console.log("👤 2");
    console.log("📦 borrower signer:", borrower);
    console.log("📦 borrower address:", borrower?.address);
    
    const Vault = await ethers.getContractFactory("VaultWithSignature");
    console.log("👤 2.5");
    //console.log("📦 tokenScore address:", tokenScore?.address);
    vault = await Vault.deploy(tokenScore.address);
    console.log("👤 3");

    const Lottery = await ethers.getContractFactory("LotteryEngine");
    lottery = await Lottery.deploy(admin.address);
    console.log("👤 4");

    const Queue = await ethers.getContractFactory("LoanQueueManager");
    queue = await Queue.deploy(admin.address);
    console.log("👤 5");

    const Executor = await ethers.getContractFactory("LoanExecutor");
    executor = await Executor.deploy(
      invoice.address,
      queue.address,
      vault.address,
      tokenScore.address
    );
    console.log("invoice:", invoice?.address);
console.log("vault:", vault?.address);
console.log("lottery:", lottery?.address);
console.log("admin:", admin?.address);

if (!invoice?.address || !vault?.address || !lottery?.address || !admin?.address) {
    throw new Error("❌ One or more addresses are null!");
  }
    const Repayment = await ethers.getContractFactory("Repayment");
    repayment = await Repayment.deploy(
      invoice.address,
      vault.address,
      lottery.address,
      admin.address
    );

    // Lender creates vault
    await vault.connect(lender).createVault();
    await vault.connect(lender).deposit({ value: ethers.utils.parseEther("10") });

  });

  it("should mint, approve, lend, and repay invoice", async function () {
    // 1. Borrower mints invoice
    const tx = await invoice.connect(borrower).mintInvoice(
      admin.address,
      ethers.utils.parseEther("1"),
      Math.floor(Date.now() / 1000 + 86400),
      "ipfs://meta"
    );
    await tx.wait();

    // 2. Admin approves
    await invoice.connect(admin).setInvoiceStatus(0, 1); // Approved

    // 3. Admin submits lottery (simulate 1 winner: lender)
    const leaf = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [lender.address, 1]));
    const root = leaf;
    await lottery.connect(admin).submitMerkleRoot(0, root);
    await lottery.verifyAndWin(0, lender.address, leaf, []); // No proof needed, 1 leaf
    await lottery.connect(admin).finalize(0);

    // 4. Admin adds winner to queue
    await queue.connect(admin).addInitialWinners(0, [lender.address]);

    // 5. Withdraw signature setup (mocked EIP712)
    const nonce = await vault.nonces(lender.address);
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const domain = {
        name: "Vault",
        version: "1",
        chainId: hre.network.config.chainId,
        verifyingContract: vault.address
      };
      

    const types = {
      Withdraw: [
        { name: "target", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };

    const value = {
      target: borrower.address,
      amount: ethers.utils.parseEther("1"),
      nonce,
      deadline
    };

    const signature = await lender._signTypedData(domain, types, value);

    // 6. Execute loan
    await executor.connect(lender).executeLoan(
      0,
      borrower.address,
      ethers.utils.parseEther("1"),
      deadline,
      signature
    );

    const statusAfterLoan = await invoice.getInvoiceStatus(0);
    expect(statusAfterLoan).to.equal(3); // LoanStarted

    // 7. Repay loan
    const repayAmount = ethers.utils.parseEther("1.06"); // 1 + 5% + 1%
    await repayment.connect(borrower).repay(0, { value: repayAmount });

    const statusAfterRepay = await invoice.getInvoiceStatus(0);
    expect(statusAfterRepay).to.equal(5); // Paid
  });
});
