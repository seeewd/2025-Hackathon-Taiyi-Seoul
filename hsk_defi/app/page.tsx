import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center font-[family-name:var(--font-geist-sans)]">
      {/* Content Sections */}
      <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 flex flex-col gap-16 py-20">
        <section>1</section>
        <section>2</section>
        <section>1</section>
        <section>2</section>
        <section>1</section>
        <section>2</section>
        <section>1</section>
        <section>2</section>
        <section>1</section>
        <section>2</section>
        <section>1</section>
        <section>2</section>
        <section>1</section>
        <section>2</section>
        <section>1</section>
        <section>2</section>
        
      </div>

      {/* CTA Section */}
      <section className="w-full bg-muted py-16 md:py-24 lg:py-32">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                지금 바로 시작하세요
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                인보이스를 NFT로 변환하고 즉시 유동성을 확보하세요
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/connect-wallet">
                <Button size="lg" className="gap-1">
                  지갑 연결하기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
