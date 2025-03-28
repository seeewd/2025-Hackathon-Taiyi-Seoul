// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract LoanQueueManager is Ownable {
    struct QueueEntry {
        address vault;
        uint256 startTime; // 거절 유예 시간 시작 시점
        bool responded;
    }

    constructor(address admin) Ownable(admin) {}

    uint256 public constant GRACE_PERIOD = 1 days;

    mapping(uint256 => QueueEntry[]) public invoiceQueues;
    mapping(uint256 => address[]) public allParticipants; // 기록용 (선택)

    event VaultQueued(uint256 indexed invoiceId, address vault);
    event VaultDeclined(uint256 indexed invoiceId, address vault);
    event VaultAutoApproved(uint256 indexed invoiceId, address vault);
    event VaultAddedToBack(uint256 indexed invoiceId, address vault);

    /// @notice 큐에 당첨자 등록 (LotteryEngine에서 호출)
    function addInitialWinners(uint256 invoiceId, address[] calldata vaults) external onlyOwner {
        require(invoiceQueues[invoiceId].length == 0, "Queue already initialized");

        for (uint256 i = 0; i < vaults.length; i++) {
            invoiceQueues[invoiceId].push(QueueEntry({
                vault: vaults[i],
                startTime: block.timestamp,
                responded: false
            }));
            allParticipants[invoiceId].push(vaults[i]);
            emit VaultQueued(invoiceId, vaults[i]);
        }
    }

    /// @notice 현재 큐 조회
    function getQueue(uint256 invoiceId) external view returns (QueueEntry[] memory) {
        return invoiceQueues[invoiceId];
    }

    /// @notice queue[0]의 vault가 거절 → token 차감 + 맨 뒤로 이동 + 새 당첨자 추가
    function declineAndReplace(uint256 invoiceId, address newVault) external {
        QueueEntry[] storage queue = invoiceQueues[invoiceId];
        require(queue.length > 0, "Queue empty");
        QueueEntry storage current = queue[0];
        require(msg.sender == current.vault, "Not your turn");
        require(!current.responded, "Already responded");

        current.responded = true;
        emit VaultDeclined(invoiceId, current.vault);

        // 기존 vault를 맨 뒤로
        queue.push(QueueEntry({
            vault: current.vault,
            startTime: block.timestamp,
            responded: false
        }));
        emit VaultAddedToBack(invoiceId, current.vault);

        // 새 당첨자 추가
        queue.push(QueueEntry({
            vault: newVault,
            startTime: block.timestamp,
            responded: false
        }));
        emit VaultQueued(invoiceId, newVault);

        // queue 앞자리 제거
        _popFront(invoiceId);
    }

    /// @notice 일정 시간이 지났으면 자동 승인 (LoanVault가 호출)
    function autoApproveIfExpired(uint256 invoiceId) external returns (address) {
        QueueEntry[] storage queue = invoiceQueues[invoiceId];
        require(queue.length > 0, "Queue empty");

        QueueEntry storage current = queue[0];
        require(!current.responded, "Already responded");
        require(block.timestamp >= current.startTime + GRACE_PERIOD, "Grace period not over");

        current.responded = true;
        emit VaultAutoApproved(invoiceId, current.vault);

        address approvedVault = current.vault;
        _popFront(invoiceId);

        return approvedVault;
    }

    function _popFront(uint256 invoiceId) internal {
        QueueEntry[] storage queue = invoiceQueues[invoiceId];
        for (uint256 i = 0; i < queue.length - 1; i++) {
            queue[i] = queue[i + 1];
        }
        queue.pop();
    }
}
