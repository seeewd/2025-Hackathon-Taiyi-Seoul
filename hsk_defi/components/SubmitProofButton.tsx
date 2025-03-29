"use client"

import { useState } from "react"
import { useWriteContract } from "wagmi"
import { parseAbi } from "viem"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import proof from "../zk/proof.json"
import pub from "../zk/public.json"

const abi = parseAbi(["function submitProof(uint256[2], uint256[2][2], uint256[2], uint256[1])"])

interface SubmitProofButtonProps {
  onSuccess?: () => void
}

export default function SubmitProofButton({ onSuccess }: SubmitProofButtonProps) {
  const { writeContract, isPending, isSuccess, error } = useWriteContract()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleClick = () => {
    const args = {
      a: [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])] as [bigint, bigint],
      b: [
        [BigInt(proof.pi_b[0][0]), BigInt(proof.pi_b[0][1])] as [bigint, bigint],
        [BigInt(proof.pi_b[1][0]), BigInt(proof.pi_b[1][1])] as [bigint, bigint],
      ] as [[bigint, bigint], [bigint, bigint]],
      c: [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])] as [bigint, bigint],
      input: [BigInt(pub[0])] as [bigint],
    }

    writeContract(
      {
        address: "0x488a60cFcb23Aeb103bA8E2E9C970F8266168D1E", // KYCRegistry
        abi,
        functionName: "submitProof",
        args: [args.a, args.b, args.c, args.input],
      },
      {
        onSuccess: () => {
          setIsSubmitted(true)
          if (onSuccess) {
            onSuccess()
          }
        },
      },
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button onClick={handleClick} disabled={isPending || isSubmitted} size="lg" className="px-8">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ZK Proof 제출 중...
          </>
        ) : isSuccess || isSubmitted ? (
          "✅ 제출 완료!"
        ) : (
          "영지식 증명(ZK Proof) 제출"
        )}
      </Button>
      {error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-900 max-w-md">
          <p className="font-medium mb-1">오류 발생:</p>
          <p>{error.message}</p>
        </div>
      )}
    </div>
  )
}

