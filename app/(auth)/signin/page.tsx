export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🎮 HabitQuest</h1>
          <p className="text-gray-600 dark:text-gray-400">
            로그인하고 모험을 시작하세요
          </p>
        </div>

        <div className="space-y-4">
          {/* Temporary - will be replaced with NextAuth */}
          <button
            className="w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
            disabled
          >
            🟡 카카오로 시작하기
          </button>

          <button
            className="w-full bg-white border-2 border-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            disabled
          >
            🔍 구글로 시작하기
          </button>

          <button
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
            disabled
          >
            🍎 Apple로 시작하기
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            인증 시스템은 다음 단계에서 구현됩니다
          </p>

          <div className="text-center">
            <a
              href="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← 메인으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
