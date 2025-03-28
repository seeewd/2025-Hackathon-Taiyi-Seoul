// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../node_modules/@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract LotteryEngine is Ownable {
    struct Round {
        bytes32 merkleRoot;
        bool finalized;
        address[] winners; // 당첨자 큐
    }
    constructor(address admin) Ownable(admin) {}

    mapping(uint256 => Round) public invoiceRounds; // invoiceId => round info

    event MerkleRootSubmitted(uint256 invoiceId, bytes32 root);
    event WinnerVerified(address indexed vault, uint256 invoiceId);

    /// @notice 오프체인에서 계산된 머클 루트를 제출 (Admin만)
    function submitMerkleRoot(uint256 invoiceId, bytes32 root) external onlyOwner {
        require(!invoiceRounds[invoiceId].finalized, "Already finalized");
        invoiceRounds[invoiceId].merkleRoot = root;
        emit MerkleRootSubmitted(invoiceId, root);
    }

    /// @notice 프론트에서 Merkle proof로 해당 vault가 당첨인지 검증 요청
    /// @param invoiceId 인보이스 ID
    /// @param vault address of vault
    /// @param leaf 해시된 leaf 값 (예: keccak256(abi.encodePacked(vault, tickets)))
    /// @param proof 머클 증명 배열
    function verifyAndWin(
        uint256 invoiceId,
        address vault,
        bytes32 leaf,
        bytes32[] calldata proof
    ) external {
        require(!invoiceRounds[invoiceId].finalized, "Already finalized");

        bytes32 root = invoiceRounds[invoiceId].merkleRoot;
        require(root != 0, "Merkle root not set");

        bool valid = MerkleProof.verify(proof, root, leaf);
        require(valid, "Invalid proof");

        invoiceRounds[invoiceId].winners.push(vault);
        emit WinnerVerified(vault, invoiceId);
    }

    /// @notice 특정 인보이스에 대한 당첨 큐 반환
    function getWinningQueue(uint256 invoiceId) external view returns (address[] memory) {
        return invoiceRounds[invoiceId].winners;
    }

    /// @notice 더 이상 추첨을 받지 않음
    function finalize(uint256 invoiceId) external onlyOwner {
        invoiceRounds[invoiceId].finalized = true;
    }
}
