export default function AnimatorPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🎤 Animateur
          </h1>
          <p className="text-gray-600 mt-2">
            Vue lecture seule du show en cours
          </p>
        </header>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Interface animateur - Vue simplifiée pour commenter le show.
          </p>
        </div>
      </div>
    </div>
  );
}
