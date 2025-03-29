pragma circom 2.0.0;

include "poseidon.circom";

template KYCCheck() {
    signal input preimage[2];     // 입력값 배열
    signal input expectedHash;    // 기대되는 해시값
    signal output isValid;

    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== preimage[0];
    poseidon.inputs[1] <== preimage[1];

    signal diff;
    diff <== poseidon.out - expectedHash;
    isValid <== 1 - (diff * diff); // 같으면 isValid == 1, 다르면 0
}

component main = KYCCheck();
