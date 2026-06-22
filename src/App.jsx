import { useState } from 'react';
import { Heart, Play, TrendingUp, Users, MessageCircle, ChevronRight, Activity } from 'lucide-react';
import stats from './data/stats.json';

// Your public profiles. Fill a field to make its link/text appear; leave it
// empty to hide it.
const PROFILES = {
  strava: 'https://www.strava.com/athletes/155787378',
  youtube: 'https://youtube.com/@raushanraavya',
  // MapMyRun profile isn't public — visitors can find Raushan by searching
  // this email inside the MapMyRun app.
  mapmyrunEmail: 'raushan_jha47@yahoo.com',
};

// Featured videos. The first two were auto-detected from your MapMyRun notes.
// Add more by pasting a YouTube URL (watch, youtu.be, or /shorts all work).
const videos = [
  { title: '10K Run', url: 'https://youtube.com/shorts/61BgNYqWaRM', category: 'Run' },
  { title: '5K Run', url: 'https://youtube.com/shorts/pBfHB3ZEqU4', category: 'Run' },
  // { title: 'Your title here', url: 'https://youtu.be/xxxxxxxxxxx', category: 'Tips' },
];

// Pull the video id out of any common YouTube URL shape.
const youTubeId = (url) => {
  const m = String(url).match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
};
const thumb = (url) => {
  const id = youTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};

// Number helpers for the stat tiles.
const nf = (n) => n.toLocaleString('en-US');
const compact = (n) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
  : nf(n);

export default function RunWithRaushanSite() {
  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'videos', label: 'Videos' },
    { id: 'blog', label: 'Blog' },
    { id: 'community', label: 'Community' },
    { id: 'support', label: 'Support' },
  ];

  // Headline tiles, all derived from your real MapMyRun export (src/data/stats.json).
  const statTiles = [
    { value: `${nf(stats.totals.distanceMi)} mi`, label: 'Total Distance', color: 'text-orange-600' },
    { value: nf(stats.totals.workouts), label: 'Workouts Logged', color: 'text-blue-600' },
    { value: `${nf(stats.totals.hours)} hrs`, label: 'Time Moving', color: 'text-teal-600' },
    { value: compact(stats.totals.steps), label: 'Steps Taken', color: 'text-orange-600' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Priya K', miles: 156, weeks: '12 weeks' },
    { rank: 2, name: 'Arun S', miles: 143, weeks: '11 weeks' },
    { rank: 3, name: 'Divya M', miles: 128, weeks: '10 weeks' },
  ];

  // Home Section
  const HomeSection = () => (
    <div className="space-y-12">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-50 to-blue-50 rounded-lg p-6 sm:p-12 text-center border border-orange-200">
        <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Run With Raushan 🏃
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-6">Inspire. Run. Grow. Join a community of runners at all levels.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700">
            Join Community
          </button>
          <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50">
            Watch Videos
          </button>
        </div>
      </div>

      {/* Stats — real numbers from MapMyRun */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statTiles.map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <p className={`text-2xl sm:text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-600 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Highlights strip */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <Activity size={16} className="text-orange-600" />
            Running since {stats.sinceDate}
          </span>
          <span>🏅 Longest run: {stats.longest.distanceKm} km ({stats.longest.distanceMi} mi), {stats.longest.date}</span>
          <span>{nf(stats.byType.Run || 0)} runs · {nf(stats.byType.Walk || 0)} walks</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>Synced from MapMyRun · updated {stats.lastUpdated}</span>
          {PROFILES.strava && (
            <a href={PROFILES.strava} target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-600 hover:text-orange-700">
              Strava profile →
            </a>
          )}
          {PROFILES.mapmyrunEmail && (
            <span>Find me on MapMyRun — search <span className="font-semibold text-gray-700">{PROFILES.mapmyrunEmail}</span></span>
          )}
        </div>
      </div>

      {/* Latest Videos */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Latest Videos</h2>
          {PROFILES.youtube && (
            <a href={PROFILES.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">
              Visit my YouTube channel <ChevronRight size={16} />
            </a>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.url} video={video} />
          ))}
        </div>
      </div>

      {/* Featured Blog */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <span className="text-teal-600 font-semibold text-sm">Latest Article</span>
        <h3 className="text-2xl font-bold mt-2 mb-4">How to Train for Your First Marathon</h3>
        <p className="text-gray-700 mb-6">A comprehensive guide covering 16-week training plans, nutrition, recovery strategies, and mental preparation for marathon runners of all levels.</p>
        <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">
          Read Article <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  // About Section
  const AboutSection = () => (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6">About RunWithRaushan</h2>
        <div className="space-y-4 text-gray-700">
          <p>Hi, I&apos;m Raushan. I believe that running is more than just exercise—it&apos;s a journey of personal growth, community, and inspiration.</p>
          <p>RunWithRaushan started as a personal mission to inspire people to move, connect, and improve their health. What began as weekend runs with friends has evolved into a thriving community of 5,000+ runners across different fitness levels.</p>
          <p>Our mission: Create an inclusive, energetic community where every mile counts—for your health and others&apos; wellbeing through Miles4Meals.</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-6">Our Values</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">Inspiration</h4>
            <p className="text-gray-700 text-sm">Motivate people to move and get healthier</p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Inclusivity</h4>
            <p className="text-gray-700 text-sm">All fitness levels welcome</p>
          </div>
          <div>
            <h4 className="font-semibold text-teal-700 mb-2">Authenticity</h4>
            <p className="text-gray-700 text-sm">Real journey, real results, real community</p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-700 mb-2">Impact</h4>
            <p className="text-gray-700 text-sm">Every mile contributes to positive change</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Community Section
  const CommunitySection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6">Community Leaderboard</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 font-semibold text-gray-700 border-b">
            <div>Rank</div>
            <div>Name</div>
            <div>Miles</div>
            <div>Streak</div>
          </div>
          {leaderboard.map((runner) => (
            <div key={runner.rank} className="grid grid-cols-4 gap-4 p-4 border-b hover:bg-orange-50 transition">
              <div className="font-bold text-orange-600">#{runner.rank}</div>
              <div className="font-semibold text-gray-900">{runner.name}</div>
              <div className="text-gray-700">{runner.miles} mi</div>
              <div className="text-gray-600 text-sm">{runner.weeks}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <MessageCircle className="text-blue-600 mb-3" size={24} />
          <h3 className="font-bold mb-2">Community Forum</h3>
          <p className="text-sm text-gray-600">Connect, discuss training, and support each other</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <Users className="text-teal-600 mb-3" size={24} />
          <h3 className="font-bold mb-2">Member Stories</h3>
          <p className="text-sm text-gray-600">Read inspiring transformations and achievements</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">This Month&apos;s Challenge</h3>
        <p className="text-gray-700 mb-4">50K Miles in June - Run or walk 50 kilometers this month and get featured on our community wall!</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white rounded-full h-3">
            <div className="bg-orange-600 rounded-full h-3" style={{width: '65%'}}></div>
          </div>
          <span className="font-semibold text-gray-700">65% complete</span>
        </div>
      </div>
    </div>
  );

  // Support Section
  const SupportSection = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6">Support RunWithRaushan</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 rounded-lg p-6">
          <Heart className="text-orange-600 mb-3" size={28} />
          <h3 className="font-bold mb-2 text-orange-900">Donate (India)</h3>
          <p className="text-sm text-orange-700 mb-4">UPI • Cards • Net Banking • Any amount</p>
          <a
            href="https://razorpay.me/@raushankumaross"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-4 py-2 bg-orange-600 text-white rounded font-semibold text-center hover:bg-orange-700"
          >
            Donate via Razorpay
          </a>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-6">
          <TrendingUp className="text-blue-600 mb-3" size={28} />
          <h3 className="font-bold mb-2 text-blue-900">Donate (International)</h3>
          <p className="text-sm text-blue-700 mb-4">Credit/Debit card • PayPal balance • Any amount</p>
          <a
            href="https://paypal.me/raushankumar2804"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold text-center hover:bg-blue-700"
          >
            Donate via PayPal
          </a>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-bold mb-4 text-lg">What Your Support Funds</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-orange-600 font-bold">•</span>
            <span>Server costs & platform maintenance</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-bold">•</span>
            <span>Community events and organized runs</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-teal-600 font-bold">•</span>
            <span>Educational content & video production</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-orange-600 font-bold">•</span>
            <span>Miles4Meals charitable initiatives</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to Join the Movement?</h3>
        <p className="mb-6">Be part of a community that&apos;s changing lives, one mile at a time.</p>
        <button className="px-8 py-3 bg-white text-orange-600 rounded-lg font-bold hover:bg-gray-100">
          Get Started Today
        </button>
      </div>
    </div>
  );

  // A video card: real YouTube thumbnail, opens the video on YouTube in a new tab.
  const VideoCard = ({ video }) => {
    const cover = thumb(video.url);
    return (
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
      >
        <div className="relative h-40 bg-gradient-to-br from-orange-400 to-blue-400 flex items-center justify-center">
          {cover && (
            <img src={cover} alt={video.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          )}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-black/55 group-hover:bg-black/70 transition">
            <Play className="text-white ml-1" size={26} fill="white" />
          </div>
        </div>
        <div className="p-4">
          {video.category && (
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-2">
              {video.category}
            </span>
          )}
          <h3 className="font-semibold text-gray-900">{video.title}</h3>
        </div>
      </a>
    );
  };

  // Render sections
  const renderSection = () => {
    switch(activeTab) {
      case 'about': return <AboutSection />;
      case 'videos': return <div><div className="flex flex-wrap items-center justify-between gap-3 mb-6"><h2 className="text-3xl font-bold">All Videos</h2>{PROFILES.youtube && <a href={PROFILES.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-2">Visit my YouTube channel <ChevronRight size={16} /></a>}</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{videos.map((v) => <VideoCard key={v.url} video={v} />)}</div></div>;
      case 'blog': return <div><h2 className="text-3xl font-bold mb-6">Blog</h2><div className="space-y-4"><div className="bg-white border border-gray-200 rounded-lg p-6"><h3 className="text-xl font-bold mb-2">How to Train for Your First Marathon</h3><p className="text-gray-700">16-week training plan, nutrition & recovery</p></div><div className="bg-white border border-gray-200 rounded-lg p-6"><h3 className="text-xl font-bold mb-2">Nutrition Guide for Runners</h3><p className="text-gray-700">Fueling your body for optimal performance</p></div></div></div>;
      case 'community': return <CommunitySection />;
      case 'support': return <SupportSection />;
      default: return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
            RunWithRaushan
          </h1>
          <div className="flex gap-4 sm:gap-6 overflow-x-auto">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`font-semibold transition whitespace-nowrap ${
                  activeTab === item.id
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {renderSection()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">RunWithRaushan</h4>
              <p className="text-gray-400 text-sm">Inspire. Run. Grow.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links</h4>
              <div className="flex flex-col gap-2 text-sm">
                <a href="https://youtube.com/@raushanraavya" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">YouTube</a>
                <a href="https://www.instagram.com/mitianraushan/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Instagram</a>
                <a href="https://www.linkedin.com/in/raushan-kumar-58305258" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">LinkedIn</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <a href="mailto:mitianraushan@gmail.com" className="text-gray-400 text-sm hover:text-white transition">
                mitianraushan@gmail.com
              </a>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 RunWithRaushan. All rights reserved. Built with passion and miles.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}