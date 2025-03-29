import SubmitProofButton from '@/components/SubmitProofButton'

export default function test() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">KYC ZK Proof 제출</h1>
      <SubmitProofButton /> {/* 여기서 버튼을 클릭하면 ZK Proof가 제출됨 */}
    </main>
  )
}
