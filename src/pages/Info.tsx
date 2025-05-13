import { useState } from "react";
import {
  FaShieldAlt,
  FaNetworkWired,
  FaBolt,
  FaRandom,
  FaVideo,
  FaLock,
  FaRocket,
  FaClipboard,
} from "react-icons/fa";
import { motion } from "framer-motion";
import copy from "copy-to-clipboard";
import { Navigation, Pagination ,Autoplay,Mousewheel} from 'swiper/modules';
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import 'swiper/css';


const cloneCommands = `git clone https://github.com/Shivamycodee/alienmeet && cd alienmeet && npm install && npm run dev`;


// Placeholder articles - replace with actual data or fetch dynamically
const articles = [
  { id: 1, title: "Introducing AlienMeet: No Borders, Just People", excerpt: "Learn about our vision for decentralized, privacy-first random video chats.", url: "/articles/introducing-alienmeet" },
  { id: 2, title: "How WebRTC Powers Peer-to-Peer Connections", excerpt: "A deep dive into our use of WebRTC signaling and direct media streams.", url: "/articles/webrtc-explained" },
  { id: 3, title: "Privacy and Security on AlienMeet", excerpt: "Why we never store personal data and how we keep chats secure.", url: "/articles/privacy-security" },
  { id: 4, title: "Scaling Peer-to-Peer Networks", excerpt: "Strategies for scaling P2P signaling and connections at scale.", url: "/articles/scaling-p2p" },
  { id: 5, title: "Future Roadmap & Features", excerpt: "What's next for AlienMeet: AR filters, live translation, and more.", url: "/articles/roadmap" }
];



const InfoPage = () => {

  const [copied, setCopied] = useState(false);

  const sectionFade = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  const copyToClipboard = () => {
    copy(cloneCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white text-gray-900 transition-colors duration-500">
      {/* Top Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <motion.a
          href="https://alienmeet.com"
          target="_blank"
          className="px-6 py-3 bg-gradient-to-r from-[#734bff] to-[#a374ff] text-white rounded-full font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaRocket className="animate-pulse" />
          Launch App
        </motion.a>
      </div>

      <div className="fixed top-4 right-8 z-50">
        <motion.a
          href="https://www.producthunt.com/posts/alienmeet?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-alienmeet"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=963231&theme=light&t=1747112409828"
            alt="Alienmeet - No borders. Just people. | Product Hunt"
            width="220"
            height="40"
          />
        </motion.a>
      </div>

      {/* Hero Section */}
      <motion.section
        className="py-16 text-center relative overflow-hidden"
        variants={sectionFade}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-[#734bff]/20 to-transparent animate-[spin_20s_linear_infinite]"
          style={{ clipPath: "circle(40% at 80% 20%)" }}
        />
        <img
          src="/logoNobg.png"
          alt="AlienMeet Logo"
          className="mx-auto mb-6 w-32 relative z-10"
        />
        <h1 className="text-4xl font-extrabold mb-4 relative z-10">
          No borders. Just Peoples 🌍✨
        </h1>
        <p className="max-w-2xl mx-auto text-lg relative z-10">
          Connect with random people without sharing personal info. Fast,
          secure, private—powered by{' '}
          <a href="https://webrtc.org/" target="_blank" className="text-[#734bff]">
            WebRTC
          </a>
        </p>
      </motion.section>

      {/* Why Section */}
      <motion.section
        className="py-12 bg-white transition-colors duration-500"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-8">
            Why AlienMeet? 🤔
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FaShieldAlt,
                title: "Privacy First",
                desc: "No personal information required.",
              },
              {
                icon: FaNetworkWired,
                title: "Decentralized",
                desc: "Peer-to-peer media flow.",
              },
              {
                icon: FaBolt,
                title: "Speed",
                desc: "Low-latency, instant connections.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Icon size={40} className="text-[#734bff] mb-4" />
                <h3 className="text-xl font-medium mb-2">{title}</h3>
                <p>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="py-12"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-8">
            How It Works 🛠️
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FaRandom, text: "Signaling server pairs you randomly." },
              { icon: FaVideo, text: "Media streams directly peer-to-peer." },
              { icon: FaLock, text: "Ensures low latency & high privacy." },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center p-6"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.4 }}
              >
                <Icon size={36} className="text-[#734bff] mb-3" />
                <p>{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Articles Section */}
<motion.section
  className="py-12 bg-gradient-to-b from-[#f8f7ff] to-[#f0eeff] transition-colors duration-500"
  variants={sectionFade}
  initial="hidden"
  whileInView="visible"
>
  <div className="max-w-6xl mx-auto px-4">
    <h2 className="text-3xl font-semibold text-center mb-8">
      Latest Insights & Updates 📰
    </h2>

    <Swiper
      modules={[Navigation, Pagination, Autoplay,Mousewheel]}
      spaceBetween={30}
      slidesPerView={'auto'}
      centeredSlides={true}
      navigation={{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }}
      pagination={{
        clickable: true,
        el: '.swiper-pagination',
        type: 'bullets',
      }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop={true}
      speed={800}
      breakpoints={{
        640: { slidesPerView: 1.2 },
        768: { slidesPerView: 1.8 },
        1024: { slidesPerView: 2.5 }
      }}
      mousewheel={{ forceToAxis: true }}
      className="relative group"
    >
      {articles.map((item) => (
        <SwiperSlide key={item.id} className="!w-[320px] sm:!w-[400px]">
       <motion.a
  href={item.url}
  className="block h-[420px] p-8 bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden"
  target="_blank"
  rel="noopener noreferrer"
  whileHover={{ scale: 1.02 }}
>
  {/* Gradient Decoration */}
  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#734bff] to-[#a374ff]" />

  {/* Glassmorphism Overlay */}
  <div className="absolute inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center z-10 rounded-3xl">
    <span className="text-xl font-semibold text-gray-800">Coming Soon</span>
  </div>

  {/* Content */}
  <div className="h-full flex flex-col justify-between">
    <div>
      <div className="mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-[#734bff] to-[#a374ff] rounded-lg flex items-center justify-center">
          <FaRocket className="text-white text-xl" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-4 text-gray-800">
        {item.title}
      </h3>
      <p className="text-gray-600 line-clamp-3">{item.excerpt}</p>
    </div>

    {/* Read More */}
    <div className="flex items-center gap-2 mt-6 text-[#734bff] font-medium">
      <span>Read article</span>
      <svg
        className="w-4 h-4 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </div>
  </div>
</motion.a>

        </SwiperSlide>
      ))}
      

    </Swiper>

  </div>
</motion.section>


      {/* Call to Action */}
      <motion.section
        className="py-16 text-center"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
      >
        <h2 className="text-3xl font-semibold mb-4">Get Started 🚀</h2>
        <p className="mb-6">
          Visit{' '}
          <a
            href="https://alienmeet.com"
            target="_blank"
            className="text-[#734bff] font-medium"
          >
            AlienMeet.com
          </a>{' '}
          instantly!
        </p>
        <div className="flex flex-col items-center justify-center gap-6">
          <a
            href="https://www.producthunt.com/posts/alienmeet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-[#734bff] text-white rounded-full font-medium hover:opacity-90 transition"
          >
            ⭐ Upvote on Product Hunt
          </a>

          <a
            href="https://www.producthunt.com/posts/alienmeet?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-alienmeet"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=963231&theme=light&t=1747112409828"
              alt="Alienmeet - No borders. Just people. | Product Hunt"
              style={{ width: "250px", height: "54px" }}
              width="250"
              height="54"
            />
          </a>
        </div>
      </motion.section>

      {/* Local Setup */}
      <motion.section
        className="py-12 bg-white transition-colors duration-500"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">How to Run Locally 🖥️</h2>

          <div className="relative bg-gray-900 dark:bg-gray-800 text-gray-100 rounded-lg p-4 text-left font-mono">
            <div
              className="absolute top-3 right-3 cursor-pointer p-1 hover:bg-gray-700 rounded"
              onClick={copyToClipboard}
            >
              <FaClipboard className="text-gray-300" />
            </div>
            <pre className="whitespace-pre-wrap">
              <code>
                {`$ git clone https://github.com/Shivamycodee/alienmeet` +
                  `\n$ cd alienmeet` +
                  `\n$ npm install` +
                  `\n$ npm run dev`}
              </code>
            </pre>
            {copied && (
              <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center rounded-lg">
                <span className="text-sm text-green-400">
                  Copied to clipboard!
                </span>
              </div>
            )}
          </div>
          <p className="mt-4">Note: Server code will be released soon. Stay tuned!</p>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="py-8 text-center text-sm text-gray-600"
        variants={sectionFade}
        initial="hidden"
        whileInView="visible"
      >
        <p>
          💡 Contribute or report issues on{' '}
          <a
            href="https://github.com/Shivamycodee/alienmeet"
            target="_blank"
            className="text-[#734bff] underline"
          >
            GitHub
          </a>
          .
        </p>
        <p>⭐ Don't forget to star the repo!</p>
      </motion.footer>

      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          width: 100%;
          height: 100%;
          background-color: #ffffff;
        }
        
        body {
          scrollbar-width: thin;
          scrollbar-color: #734bff #f1f1f1;
          overflow-y: auto;
          overflow-x: hidden;
        }
        
        body::-webkit-scrollbar {
          width: 8px;
        }
        
        body::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        body::-webkit-scrollbar-thumb {
          background-color: #734bff;
          border-radius: 10px;
        }
        
        #__next {
          min-height: 100vh;
          background-color: #ffffff;
        }

        .swiper-button-prev,
.swiper-button-next {
  background: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(115, 75, 255, 0.2);
  transition: all 0.3s ease;
}

.swiper-button-prev:hover,
.swiper-button-next:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(115, 75, 255, 0.3);
}

.swiper-pagination-bullet {
  background: #d1d1e0;
  opacity: 1;
  width: 10px;
  height: 10px;
  transition: all 0.3s ease;
}

.swiper-pagination-bullet-active {
  background: #734bff;
  width: 24px;
  border-radius: 8px;
}

.swiper-slide {
  transition: transform 0.8s ease, opacity 0.8s ease;
}

.swiper-slide:not(.swiper-slide-active) {
  opacity: 0.5;
  transform: scale(0.9);
}

      `}</style>

    </div>
  );
};

export default InfoPage;
