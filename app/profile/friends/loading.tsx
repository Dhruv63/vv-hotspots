export default function Loading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-20 bg-gray-800 rounded-lg"></div>
        </div>
      ))}
    </div>
  )
}
