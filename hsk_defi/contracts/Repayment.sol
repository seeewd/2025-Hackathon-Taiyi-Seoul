// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvoiceNFT.sol";
import "./VaultWithSignature.sol";
import "./LotteryEngine.sol";

contract Repayment {
    InvoiceNFT public invoiceNFT;
    VaultWithSignature public vaultContract;
    LotteryEngine public lottery;

    address public admin;

    uint256 public constant INTEREST_RATE_BPS = 500; // 5% = 500 basis points
    uint256 public constant FEE_RATE_BPS = 100;      // 1% = 100 basis points
    uint256 public constant BPS_DENOMINATOR = 10000;

    event Repaid(
        uint256 indexed invoiceId,
        address indexed borrower,
        uint256 totalAmount,
        uint256 feeAmount,
        uint256 interestAmount,
        uint256 principalAmount
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _invoiceNFT, address _vault, address _lottery) {
        invoiceNFT = InvoiceNFT(_invoiceNFT);
        vaultContract = VaultWithSignature(payable(_vault));
        lottery = LotteryEngine(_lottery);
        admin = msg.sender;
    }

    /// @notice borrower가 대출 상환 (이자+수수료 포함)
    function repay(uint256 invoiceId) external payable {
        InvoiceNFT.InvoiceData memory invoice = invoiceNFT.getInvoice(invoiceId);

        require(invoice.status == InvoiceNFT.Status.LoanStarted, "Loan not started");
        require(msg.sender == invoice.issuer, "Not the borrower");

        uint256 principal = invoice.amount;
        uint256 interest = (principal * INTEREST_RATE_BPS) / BPS_DENOMINATOR;
        uint256 fee = (principal * FEE_RATE_BPS) / BPS_DENOMINATOR;
        uint256 totalDue = principal + interest + fee;

        require(msg.value >= totalDue, "Insufficient repayment");

        // 당첨된 vault 리스트 가져오기
        address[] memory winners = lottery.getWinningQueue(invoiceId);
        require(winners.length > 0, "No lenders found");

        // 전체 금액: 원금 + 이자 + 수수료 → vault에 균등 분배
        uint256 shareAmount = totalDue / winners.length;

        for (uint256 i = 0; i < winners.length; i++) {
            vaultContract.depositFor{value: shareAmount}(winners[i]);
        }

        // Invoice 상태 업데이트
        invoiceNFT.setInvoiceStatus(invoiceId, InvoiceNFT.Status.Paid);

        emit Repaid(invoiceId, msg.sender, msg.value, fee, interest, principal);
    }

    /// @notice admin 변경 (선택)
    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin");
        admin = newAdmin;
    }
}
