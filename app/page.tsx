import Image from "next/image";
import Board from "./components/Board";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-6 sm:p-12">
      <header className="pt-4 pb-2">
        <h1 className="game-title">SuccincTacToe</h1>
      </header>
      
      <main className="flex flex-col gap-6 items-center">
        <Board />
      </main>
      
      <footer className="footer">
        <div className="footer-text">
          Made with <span className="heart">♥</span> by <span className="author">nomindart</span>
        </div>
      </footer>
    </div>
  );
}
