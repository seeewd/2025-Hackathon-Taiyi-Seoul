// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./TokenScore.sol";

contract VaultWithSignature is Ownable {
    using ECDSA for bytes32;

    TokenScore public tokenScore;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public nonces;

    bytes32 private constant _TYPEHASH = keccak256("Withdraw(address target,uint256 amount,uint256 nonce,uint256 deadline)");
    bytes32 private immutable _DOMAIN_SEPARATOR;

    event VaultCreated(address indexed user);
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _tokenScore) Ownable(msg.sender) {
        tokenScore = TokenScore(_tokenScore);

        _DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes("Vault")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    /// @notice Vault 생성 (TokenScore에 등록)
    function createVault() external {
        require(balances[msg.sender] == 0, "Already created");
        tokenScore.registerVault(msg.sender, 0);
        emit VaultCreated(msg.sender);
    }

    /// @notice 직접 입금
    function deposit() public payable {
        balances[msg.sender] += msg.value;
        tokenScore.updateDeposit(msg.sender, balances[msg.sender]);
        emit Deposited(msg.sender, msg.value);
    }

    /// @notice 외부 계정이 대신 예치
    function depositFor(address user) external payable {
        require(user != address(0), "Invalid user");
        balances[user] += msg.value;
        tokenScore.updateDeposit(user, balances[user]);
        emit Deposited(user, msg.value);
    }

    /// @notice 출금 (내 지갑으로 직접 출금)
    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        balances[msg.sender] = 0;
        tokenScore.updateDeposit(msg.sender, 0);
        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }
/// @notice 서명 기반 출금
function withdrawWithSignature(
    address user,
    address target,
    uint256 amount,
    uint256 deadline,
    bytes calldata signature
) external {
    require(block.timestamp <= deadline, "Signature expired");
    require(balances[user] >= amount, "Insufficient balance");

    bytes32 structHash = keccak256(abi.encode(
        _TYPEHASH,
        target,
        amount,
        nonces[user],
        deadline
    ));

    bytes32 digest = keccak256(abi.encodePacked(
        "\x19\x01",
        _DOMAIN_SEPARATOR,
        structHash
    ));

    address signer = digest.recover(signature);
    require(signer == user, "Invalid signature");

    nonces[user]++;
    balances[user] -= amount;
    tokenScore.updateDeposit(user, balances[user]); // ✅ TokenScore 연동
    payable(target).transfer(amount);

    emit Withdrawn(user, amount);
}

 

    /// @notice 외부에서 회복 (스케줄링)
    function recoverTokens(address[] calldata vaults) external onlyOwner {
        for (uint256 i = 0; i < vaults.length; i++) {
            tokenScore.recoverToken(vaults[i]);
        }
    }

    receive() external payable {
        deposit();
    }
}