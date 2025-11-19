export default function Footer() {
  return (
    <footer className="bg-gray-800/30 border-t border-gray-700 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Code Battle</h3>
            <p className="text-gray-400">
              The ultimate 1v1 coding arena. Test your skills against developers worldwide.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</a></li>
              <li><a href="/game" className="hover:text-primary-400 transition-colors">Play Now</a></li>
              <li><a href="/#arenas" className="hover:text-primary-400 transition-colors">Arenas</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Code Battle. Built with Next.js, Socket.io & Monad.</p>
        </div>
      </div>
    </footer>
  );
}