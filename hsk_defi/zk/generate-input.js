const circomlibjs = require("circomlibjs")
const fs = require("fs")

async function main() {
  const poseidon = await circomlibjs.buildPoseidon()
  const F = poseidon.F

  const preimage = [123456789n, 987654321n]
  const hash = poseidon(preimage)
  const hashHex = F.toString(hash)

  const input = {
    preimage: preimage.map(String),
    expectedHash: hashHex
  }

  fs.writeFileSync("input.json", JSON.stringify(input, null, 2))
  console.log("input.json 생성 완료:", input)
}

main()
