import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-6xl font-bold mb-6 animate-pulse-slow">
              🎮 HabitQuest
            </h1>
            <p className="text-2xl mb-4">습관을 게임처럼, 성장을 모험처럼</p>
            <p className="text-lg opacity-90">
              RPG 캐릭터를 키우듯이 재미있게 습관을 만들어보세요
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass rounded-2xl p-6">
              <div className="text-4xl mb-3">⚔️</div>
              <h3 className="text-xl font-bold mb-2">RPG 캐릭터 육성</h3>
              <p className="text-sm opacity-90">
                습관을 완료하고 경험치를 얻어 캐릭터를 성장시키세요
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="text-xl font-bold mb-2">스트릭 시스템</h3>
              <p className="text-sm opacity-90">
                연속으로 습관을 지키고 특별한 보상을 받으세요
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-xl font-bold mb-2">친구와 경쟁</h3>
              <p className="text-sm opacity-90">
                친구들과 길드를 만들고 함께 성장하세요
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              지금 시작하기
            </Link>
            <p className="text-sm opacity-75">
              무료로 시작하고, 언제든 프리미엄으로 업그레이드하세요
            </p>
          </div>

          {/* Subscription Plans Preview */}
          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 text-left">
              <h4 className="text-2xl font-bold mb-3">🌟 모험자 (무료)</h4>
              <ul className="space-y-2 text-sm">
                <li>✅ 기본 습관 5개</li>
                <li>✅ 캐릭터 육성</li>
                <li>✅ 스트릭 시스템</li>
                <li>✅ 주간 랭킹 참여</li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-6 text-left border-2 border-yellow-400">
              <h4 className="text-2xl font-bold mb-3">👑 영웅 (프리미엄)</h4>
              <p className="text-xl mb-3">월 4,900원</p>
              <ul className="space-y-2 text-sm">
                <li>✅ 무제한 습관</li>
                <li>✅ 광고 제거</li>
                <li>✅ 프리미엄 코스튬 & 펫</li>
                <li>✅ 상세 통계 & AI 인사이트</li>
                <li>✅ 길드 생성 & 관리</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-white py-8">
        <p className="opacity-75 text-sm">
          © 2025 HabitQuest. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
