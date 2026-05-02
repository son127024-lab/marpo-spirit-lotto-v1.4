export function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-6 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-balance">Lottoworld.pi</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">Weekly Lottery Game</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">π</div>
          </div>
        </div>
      </div>
    </header>
  )
}
export default Header;