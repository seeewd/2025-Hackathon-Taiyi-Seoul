// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./invoice.sol";
import "./loanqueue.sol";
import "./vault.sol";
import "./TokenScore.sol";

contract LoanExecutor {
    InvoiceNFT public invoiceNFT;
    LoanQueueManager public loanQueue;
    VaultWithSignature public vaultContract;
    TokenScore public tokenScore;

    address public admin;

    event LoanExecuted(uint256 indexed invoiceId, address indexed vault, address indexed borrower, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(
        address _invoiceNFT,
        address _loanQueue,
        address _vault,
        address _tokenScore
    ) {
        invoiceNFT = InvoiceNFT(_invoiceNFT);
        loanQueue = LoanQueueManager(_loanQueue);
        vaultContract = VaultWithSignature(payable(_vault));
        tokenScore = TokenScore(_tokenScore);
        admin = msg.sender;
    }

    /// @notice queue[0]의 vault가 직접 대출 실행
    function executeLoan(
        uint256 invoiceId,
        address target,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external {
        LoanQueueManager.QueueEntry[] memory queue = loanQueue.getQueue(invoiceId);
        require(queue.length > 0, "Empty queue");

        address vault = queue[0].vault;
        require(msg.sender == vault, "Not your turn");

        InvoiceNFT.InvoiceData memory invoice = invoiceNFT.getInvoice(invoiceId);
        require(invoice.status == InvoiceNFT.Status.Approved, "Invoice not approved");
        require(invoice.issuer == target, "Target must be borrower");
        require(invoice.amount == amount, "Amount mismatch");

        // vault가 사전에 서명한 서명 전달
        vaultContract.withdrawWithSignature(
            vault, target, amount, deadline, signature
        );

        tokenScore.useToken(vault);
        invoiceNFT.setInvoiceStatus(invoiceId, InvoiceNFT.Status.LoanStarted);

        emit LoanExecuted(invoiceId, vault, target, amount);
    }

    /// @notice grace period 초과 시 자동 실행
    function autoExecuteLoan(
        uint256 invoiceId,
        address target,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external {
        address vault = loanQueue.autoApproveIfExpired(invoiceId);

        InvoiceNFT.InvoiceData memory invoice = invoiceNFT.getInvoice(invoiceId);
        require(invoice.status == InvoiceNFT.Status.Approved, "Invoice not approved");
        require(invoice.issuer == target, "Target must be borrower");
        require(invoice.amount == amount, "Amount mismatch");

        vaultContract.withdrawWithSignature(
            vault, target, amount, deadline, signature
        );

        tokenScore.useToken(vault);
        invoiceNFT.setInvoiceStatus(invoiceId, InvoiceNFT.Status.LoanStarted);

        emit LoanExecuted(invoiceId, vault, target, amount);
    }

    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid");
        admin = newAdmin;
    }
}
