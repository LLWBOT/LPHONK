// pages/index.js import Image from 'next/image'; import Link from 'next/link';

export default function Home() { const covers = [ { title: 'Montagem Tomada', artist: 'DJ Kai', img: '/covers/cover1.jpg' }, { title: 'Passo Bem Solto', artist: 'DJ LXX', img: '/covers/cover2.jpg' }, { title: 'Mortals Funk', artist: 'DJ Neo', img: '/covers/cover3.jpg' }, { title: 'Veki Veki', artist: 'DJ Flex', img: '/covers/cover4.jpg' }, { title: 'Montagem Drift', artist: 'DJ Phantom', img: '/covers/cover5.jpg' }, { title: 'Funk Remix', artist: 'DJ Blaze', img: '/covers/cover6.jpg' }, ];

const faqs = [ { q: 'Who can upload tracks?', a: 'Anyone with an account can upload, but tracks must pass the admin review.' }, { q: 'How long does review take?', a: 'Usually 24–48 hours to ensure quality and genre fit.' }, { q: 'Can I listen before uploading?', a: 'Yes! Explore all approved tracks in the public feed.' }, { q: 'Can friends help approve tracks?', a: 'Only trusted admins you choose can approve/reject tracks.' }, ];

return ( <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#001a33] text-white"> {/* Navbar / Header */} <header className="flex items-center justify-between p-6 border-b border-blue-800"> <h1 className="text-4xl font-extrabold text-[#00d4ff] tracking-widest">LPHONK</h1> <div className="space-x-4"> <Link href="/login" className="px-4 py-2 border border-[#00d4ff] rounded-lg hover:bg-[#00d4ff] hover:text-black transition">Login</Link> <Link href="/signup" className="px-4 py-2 bg-[#00d4ff] rounded-lg hover:bg-[#00b8e6] transition">Sign Up</Link> </div> </header>

{/* Hero Section */}
  <section className="text-center py-20">
    <h2 className="text-5xl font-bold mb-4">The Ultimate Home for Montagem & Funk</h2>
    <p className="text-xl mb-6">Upload, get reviewed, and share your underground tracks with real listeners.</p>
    <div className="space-x-4">
      <Link href="/signup" className="px-6 py-3 bg-[#00d4ff] rounded-lg text-black font-semibold hover:bg-[#00b8e6] transition">Get Started</Link>
      <Link href="/login" className="px-6 py-3 border border-[#00d4ff] rounded-lg hover:bg-[#00d4ff] hover:text-black transition">Explore</Link>
    </div>
  </section>

  {/* Featured Covers Section */}
  <section className="py-16 px-6">
    <h3 className="text-3xl font-bold text-center mb-10">🔥 Trending Montagem / Funk</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {covers.map((cover, index) => (
        <div key={index} className="bg-[#001a33] rounded-xl overflow-hidden shadow-lg hover:scale-105 transition transform">
          <Image src={cover.img} alt={cover.title} width={300} height={300} className="w-full h-auto" />
          <div className="p-2 text-center">
            <h4 className="font-semibold text-lg">{cover.title}</h4>
            <p className="text-sm text-blue-300">{cover.artist}</p>
          </div>
        </div>
      ))}
    </div>
  </section>

  {/* About Section */}
  <section className="py-16 px-6 bg-[#001a44] text-center">
    <h3 className="text-3xl font-bold mb-6">Why LPHONK?</h3>
    <p className="text-lg mb-8 max-w-3xl mx-auto">LPHONK is a platform built for montage and funk creators. Every upload is carefully reviewed to keep the community authentic and safe. Share your tracks, explore underground beats, and discover the next big montage vibe.</p>
    <div className="flex flex-wrap justify-center gap-8">
      <div className="flex flex-col items-center w-40">
        <span className="text-4xl mb-2">🎵</span>
        <p>Upload & Share</p>
      </div>
      <div className="flex flex-col items-center w-40">
        <span className="text-4xl mb-2">✅</span>
        <p>Reviewed for Quality</p>
      </div>
      <div className="flex flex-col items-center w-40">
        <span className="text-4xl mb-2">🎧</span>
        <p>Stream Underground Funk</p>
      </div>
      <div className="flex flex-col items-center w-40">
        <span className="text-4xl mb-2">💬</span>
        <p>Get Feedback</p>
      </div>
    </div>
  </section>

  {/* FAQ Section */}
  <section className="py-16 px-6">
    <h3 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h3>
    <div className="max-w-4xl mx-auto space-y-6">
      {faqs.map((faq, index) => (
        <div key={index} className="bg-[#001a33] p-6 rounded-lg shadow-md hover:shadow-lg transition">
          <h4 className="font-semibold text-xl mb-2">Q: {faq.q}</h4>
          <p className="text-blue-300">A: {faq.a}</p>
        </div>
      ))}
    </div>
  </section>

  {/* Random Fun Section */}
  <section className="py-16 px-6 bg-[#001a44] text-center">
    <h3 className="text-3xl font-bold mb-6">Tip of the Day</h3>
    <p className="text-lg mb-6">🎵 “Try adding subtle vinyl crackle to your montage tracks for that authentic underground vibe.”</p>
    <button className="px-6 py-3 bg-[#00d4ff] rounded-lg text-black font-semibold hover:bg-[#00b8e6] transition">Discover a Random Funk Track</button>
  </section>

  {/* Footer */}
  <footer className="py-10 bg-[#001122] text-center text-blue-300">
    <div className="mb-4">
      <Link href="/" className="mx-2 hover:text-white transition">Home</Link>
      <Link href="/about" className="mx-2 hover:text-white transition">About</Link>
      <Link href="/upload" className="mx-2 hover:text-white transition">Upload</Link>
      <Link href="/login" className="mx-2 hover:text-white transition">Login</Link>
      <Link href="/signup" className="mx-2 hover:text-white transition">Sign Up</Link>
      <Link href="/contact" className="mx-2 hover:text-white transition">Contact</Link>
    </div>
    <p>© 2025 LPHONK. All rights reserved.</p>
  </footer>
</div>

); }
