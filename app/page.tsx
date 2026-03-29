export default function Home() {
  return (
    <div className="min-h-screen bg-bg-warm flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif text-primary font-bold">EPI Assist</h1>
        <p className="text-dark-light">Legislația medicală într-un singur loc</p>
        <div className="flex gap-3 justify-center">
          <span className="px-4 py-2 bg-primary text-white rounded-lg">Primary</span>
          <span className="px-4 py-2 bg-secondary text-white rounded-lg">Secondary</span>
          <span className="px-4 py-2 bg-accent text-white rounded-lg">Accent</span>
        </div>
      </div>
    </div>
  );
}
