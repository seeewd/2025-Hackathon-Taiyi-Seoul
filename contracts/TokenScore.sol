// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenScore is Ownable {
    struct VaultStats {
        uint256 token;
        uint256 lastUpdate;
        uint256 loanCount;
        uint256 deposit; // 예치금 (Vault와 연동됨)
    }
    constructor(address admin) Ownable(admin) {}

    mapping(address => VaultStats) public vaultStats;

    uint256 public constant MAX_TOKEN = 1000;
    uint256 public constant MIN_TOKEN = 0;

    event TokenUsed(address indexed vault, uint256 amount);
    event TokenRecovered(address indexed vault, uint256 newTotal);
    event DepositUpdated(address indexed vault, uint256 deposit);

    /// @notice Vault 최초 등록
    function registerVault(address vault, uint256 initialDeposit) external onlyOwner {
        VaultStats storage stats = vaultStats[vault];
        require(stats.token == 0 && stats.lastUpdate == 0, "Already registered");

        stats.token = MAX_TOKEN;
        stats.lastUpdate = block.timestamp;
        stats.deposit = initialDeposit;
        stats.loanCount = 0;
    }

    /// @notice Vault 예치금 변경 (LoanVault와 연동)
    function updateDeposit(address vault, uint256 newAmount) external onlyOwner {
        vaultStats[vault].deposit = newAmount;
        emit DepositUpdated(vault, newAmount);
    }

    /// @notice 대출 실행 시 token 감소 (예치금 많으면 덜 감소)
    function useToken(address vault) external onlyOwner {
        VaultStats storage stats = vaultStats[vault];

        uint256 decay = calculateDecay(stats.deposit);
        if (stats.token > decay) {
            stats.token -= decay;
        } else {
            stats.token = MIN_TOKEN;
        }

        stats.loanCount++;
        stats.lastUpdate = block.timestamp;

        emit TokenUsed(vault, decay);
    }

    /// @notice 회복 함수: 시간, 예치금, 활동 이력 기반
    function recoverToken(address vault) external onlyOwner {
        VaultStats storage stats = vaultStats[vault];

        uint256 timeElapsed = block.timestamp - stats.lastUpdate;
        uint256 timeRecovery = (timeElapsed / 3600) * 10; // 시간당 10점 회복

        uint256 depositRecovery = log2(stats.deposit + 1); // +1 to avoid log(0)
        uint256 activityRecovery = stats.loanCount * 2;

        uint256 totalRecovery = timeRecovery + depositRecovery + activityRecovery;
        stats.token = min(MAX_TOKEN, stats.token + totalRecovery);
        stats.lastUpdate = block.timestamp;

        emit TokenRecovered(vault, stats.token);
    }

    /// @notice 현재 token 조회
    function getToken(address vault) external view returns (uint256) {
        return vaultStats[vault].token;
    }

    /// @dev 예치금 기반 감소량 계산 (클수록 덜 감소)
    function calculateDecay(uint256 deposit) public pure returns (uint256) {
        if (deposit >= 10 ether) return 30;
        if (deposit >= 5 ether) return 40;
        if (deposit >= 1 ether) return 60;
        return 80;
    }

    /// @dev 로그 근사 함수 (log2)
    function log2(uint256 x) public pure returns (uint256 result) {
        while (x > 1) {
            x >>= 1;
            result++;
        }
    }

    function min(uint256 a, uint256 b) public pure returns (uint256) {
        return a < b ? a : b;
    }
}
