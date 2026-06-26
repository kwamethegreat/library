

export default function Home() {
  return (
    <div className="bg-background text-foreground p-8">
      <div className="bg-surface border border-border rounded-lg p-6">
        <h1 className="text-accent text-2xl font-bold">Accent (sky)</h1>
        <p className="text-success">Success (green)</p>
        <p className="text-muted-foreground">Muted foreground</p>
      </div>
    </div>
  );
}
