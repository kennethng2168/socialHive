export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="block">
              <div className="flex items-center">
                <img
                  src="/socialHive-logo.png"
                  alt="SocialHive Logo"
                  className="h-8"
                />
              </div>
            </a>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Amber Chen</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-600 rounded-full" />
              </div>
              {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
              <button className="text-gray-500 hover:text-gray-700">
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Features Grid */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-4 ">
              Every AI tool you need to create and grow your content - in one
              place
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto light-text">
              Explore smart generators for images, videos, captions, and trends
              — or combine them with our
              <br />
              All-in-One mode. Create, test, and share content seeamlessly
              across all platforms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* All-in-One Content Creator */}
            <a href="/tool/all-in-one" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <img
                    src="/mainPage_assets/bee.png"
                    alt="All-in-One Content Creator"
                    className="h-15"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  All-in-One Content Creator
                </h3>
                <p className="text-gray-600 mb-4 light-text">
                  Generate full content sets in one go — from images to videos,
                  lipsyncm and music — powered by smart AI agents
                </p>
              </div>
            </a>

            {/* Image-to-Video Animator */}
            <a href="/tool/image-to-video" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <img
                    src="/mainPage_assets/dragon.png"
                    alt="Image-to-Video Animator"
                    className="h-15"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Image-to-Video Animator
                </h3>
                <p className="text-gray-600 mb-4 light-text">
                  Prompt whatever you desire and watch it come to life with
                  smooth AI-powered animation
                </p>
              </div>
            </a>

            {/* AI Music Video Studio */}
            <a href="/tool/ai-music-video" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <img
                    src="/mainPage_assets/star.png"
                    alt="AI Music Video Studio"
                    className="h-15"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Music Video Studio
                </h3>
                <p className="text-gray-600 mb-4 light-text">
                  Combine AI-generated soundtracks, visuals, and motion into a
                  polished music video — all in one place.
                </p>
              </div>
            </a>

            {/* AI Video Generation Studio */}
            <a href="/video-gen" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <img
                    src="/mainPage_assets/starfish.png"
                    alt="AI Video Generation Studio"
                    className="h-15"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Video Generation Studio
                </h3>
                <p className="text-gray-600 mb-4 light-text">
                  Create dynamic short videos in minutes using state-of-the-art
                  AI models. Perfect for reels, ads, and social content.
                </p>
              </div>
            </a>

            {/* AI Image Generation Studio */}
            <a href="/image-gen" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <img
                    src="/mainPage_assets/cookie.png"
                    alt="AI Image Generation Studio"
                    className="h-15"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Image Generation Studio
                </h3>
                <p className="text-gray-600 mb-4 light-text">
                  Turn your ideas into stunning visuals. Generate high-quality,
                  photorealistic images with advanced AI models.
                </p>
              </div>
            </a>

            {/* AI Copywriting Studio */}
            <a href="/copywriting" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <img
                    src="/mainPage_assets/banana.png"
                    alt="AI Copywriting Studio"
                    className="h-15"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Copywriting Studio
                </h3>
                <p className="text-gray-600 mb-4 light-text">
                  Instantly write catchy captions, taglines, and post copy that
                  fits your style and audience.
                </p>
              </div>
            </a>

            {/* AI Content Assistant */}
            <a href="/ai-assistant" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <img
                    src="/mainPage_assets/flower.png"
                    alt="AI Content Assistant"
                    className="h-15"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  AI Content Assistant
                </h3>
                <p className="text-gray-600 mb-4 light-text">
                  Get personalized recommendations, performance insights, and
                  content ideas to grow your social presence.
                </p>
              </div>
            </a>

            {/* Virtual Try-On Studio */}
            <a href="/virtual-try-on" className="block">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <img
                    src="/mainPage_assets/person.png"
                    alt="Virtual Try-On Studio"
                    className="h-15"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Virtual Try-On Studio
                </h3>
                <p className="text-gray-600 mb-4 light-text">
                  Try outfits in seconds with AI. Upload a photo and instantly
                  preview how any clothing looks on you.
                </p>
              </div>
            </a>

            {/* More features in development */}
            <div
              className=" rounded-xl p-4 hover:shadow-lg transition-shadow relative"
              style={{
                backgroundImage: 'url("/colorbox.png")',
                backgroundSize: "150% 150%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                More features in development
              </h3>
              <p className="text-gray-600 mb-4 light-text">
                We're constantly improving your creative workflow. Upcoming
                features include advanced video editing, team collaboration
                tools, content scheduling, and AI-driven analytics — all
                designed to make your creative process faster and smarter.
              </p>
            </div>

            {/* Decorative Bottom Right Image */}
            <div />
            <div />
            <div className="flex justify-end items-end">
              <img
                src="/mainPage_assets/cats.png"
                alt="cats"
                className="w-40 h-40"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
