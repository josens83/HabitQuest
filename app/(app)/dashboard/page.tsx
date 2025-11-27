export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">오늘의 퀘스트</h1>
        <p className="text-gray-600 dark:text-gray-400">
          습관을 완료하고 캐릭터를 성장시키세요!
        </p>
      </div>

      {/* Character Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">모험가</h2>
            <p className="text-sm opacity-90">레벨 1 레인저</p>
          </div>
          <div className="text-4xl">⚔️</div>
        </div>

        {/* EXP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>EXP</span>
            <span>0 / 100</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 text-center text-sm">
          <div>
            <div className="text-xs opacity-75">힘</div>
            <div className="font-bold">1</div>
          </div>
          <div>
            <div className="text-xs opacity-75">지능</div>
            <div className="font-bold">1</div>
          </div>
          <div>
            <div className="text-xs opacity-75">체력</div>
            <div className="font-bold">1</div>
          </div>
          <div>
            <div className="text-xs opacity-75">정신</div>
            <div className="font-bold">1</div>
          </div>
          <div>
            <div className="text-xs opacity-75">매력</div>
            <div className="font-bold">1</div>
          </div>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">연속 달성 스트릭</h3>
            <p className="text-3xl font-bold text-orange-500">🔥 0일</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              최고 기록
            </p>
            <p className="text-2xl font-bold">0일</p>
          </div>
        </div>
      </div>

      {/* Today's Quests */}
      <div>
        <h3 className="text-lg font-bold mb-4">오늘의 퀘스트</h3>

        <div className="space-y-3">
          {/* Empty State */}
          <div className="bg-white dark:bg-dark-surface rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              아직 습관이 없습니다
            </p>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              첫 번째 습관 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
