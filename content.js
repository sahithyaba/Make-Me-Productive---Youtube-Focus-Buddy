const entertainmentKeywords = [
  "music", "comedy", "trailer", "gameplay", "reaction", "vlog", "promo", "husband", "wife", "couple",
  "boyfriend", "girlfriend", "family", "friends", "fun", "entertainment", "shorts", "youtube shorts",
  "bollywood", "tollywood", "kollywood", "tamil", "dance", "short film",
  "hook step", "songs", "bgm", "teaser", "funny", "meme", "celebrity", "romantic",
  "love", "open talk", "relationship", "trip", "galatta", "dance show", "singing show",
  "interview", "pregnancy", "marriage", "video song", "movie", "korean series", "korean drama",
  "chinese drama", "drama", "series", "show", "reality show", "trending", "viral", "challenge", "funny videos",
  "funny moments", "prank", "skit", "parody", "spoof", "reaction video", "behind the scenes", "behind the scene", 
  "actor", "actress", "celebrity news", "celebrity gossip", "celebrity interview", "celebrity lifestyle",
  "celebrity fashion", "celebrity makeup", "celebrity skincare", "celebrity workout", "celebrity diet", "celebrity health",
  "beatbox", "dance challenge", "singing challenge", "lip sync", "meme compilation", "funny compilation",
  "best moments", "funniest moments", "epic moments", "fail compilation", "try not to laugh", "try not to cry",
  "try not to smile", "try not to get scared", "try not to cringe", "try not to sing", "try not to dance", "try not to laugh", 
  "entertainment", "prank", "party", "celebration", "event", "festival", "holiday", "vacation",
  "trip", "travel", "adventure", "exploration", "journey", "road trip", "backpacking", "camping", "hiking",
  "ft", "song", "music video", "music album", "music playlist", "music mix", "music compilation", "birthday", "anniversary",
  "wedding", "engagement", "baby shower", "bridal shower", "bachelorette party", "bachelor party", "graduation",
  "farewell", "reunion", "get together", "family gathering", "friends gathering", "office party", "audio", "audio song",
  "saree review", "saree draping", "saree styling", "saree collection", "saree haul", "saree lookbook", "shopping",
  "hairstyles", "hairstyle tutorial", "hairstyle ideas", "hairstyle inspiration", "hairstyle trends", "hairstyle hacks",
  "travel vlog", "travel guide", "travel tips", "travel hacks", "travel inspiration", "travel photography", "pretty",
  "beautiful", "gorgeous", "stunning", "cute", "adorable", "lovely", "pretty", "fashion", "style", "outfit", "clothing",
  "accessories", "jewelry", "makeup", "skincare", "beauty", "cosmetics", "nail art", "nail design", "nail tutorial",
  "BTS", "behind the scenes", "making of", "on set", "off set", "outtakes", "blooper", "bloopers", "funny moments",
  "cooking", "blouse", "tour", "stage performance", "live performance", "concert", "music festival", "love", "Red carpet",
  "cwc", "super hits", "netflix", "amazon prime", "hotstar", "disney plus", "concert", "rapid fire"
];

const educationalKeywords = ["education", "tutorial", "how to", "lesson", "course", "study", "explained", "lecture"];

const distractingKeywordMessages = {
  music: "Silence can be golden when you're learning.",
  comedy: "Laughter is great, but focus fuels progress!",
  movie: "Blockbusters can wait. Build your future now.",
  prank: "Real success isn't a prank!",
  reaction: "React to your goals instead!",
  vlog: "Make your own story worth vlogging!",
  shorts: "Think long-term. Skip the Shorts.",
  entertainment: "Fun's great, but growth is better.",
  trailer: "Focus on the bigger picture, not just trailers.",
  gameplay: "Build your own game of success!",
  bollywood: "Bollywood can wait. Your skills can't.",
  tollywood: "Success doesn't have subtitles. Focus!",
  kollywood: "Forget the drama, focus on your dreams.",
  dance: "Dance through your work and focus on growth!",
  funny: "Laughter fades, but learning lasts.",
  meme: "Memes are cool, but mastering skills is cooler.",
  romantic: "Love yourself by learning new skills!",
  love: "Love for learning is the ultimate romance.",
  celebrity: "Become your own celebrity with skills!",
  challenge: "Challenge yourself to stay focused!",
  viral: "Chase knowledge, not viral trends.",
  reality_show: "Real success doesn't happen on reality shows.",
  skit: "Focus on your script for success, not skits.",
  behind_the_scenes: "Success is made behind the scenes.",
  actor: "Be the actor of your own life story.",
  actress: "Focus on becoming the star of your own future.",
  beatbox: "Beat your distractions with focus!",
  fail_compilation: "Don't compile fails. Compile skills!"
};

const motivationalOverlayStyle = `
  position: absolute;
  top: -10px; left: 0;
  width: 100%; height: 105%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5px;
  font-size: 14px;
  font-weight: bold;
  color: #222;
  border-radius: 12px;
  z-index: 9999;
`;

let filterRunning = false;
let isFilterEnabled = false;

let stats = {
  filteredCount: 0,
  educationalCount: 0,
  totalVideos: 0,
  watchTime: {
    educational: 0,
    entertainment: 0
  }
};

function isEducational(text) {
  return educationalKeywords.some(keyword =>
    text.toLowerCase().includes(keyword)
  );
}

function shouldFilterOut(text) {
  const lowerText = text.toLowerCase();
  return entertainmentKeywords.find(keyword =>
    lowerText.includes(keyword)
  );
}

function getMotivationalMessage(keyword) {
  if (distractingKeywordMessages[keyword]) {
    return distractingKeywordMessages[keyword];
  }
  const messages = Object.values(distractingKeywordMessages);
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

function trackVideoWatchTime() {
  try {
    const video = document.querySelector('video');
    if (!video) return;

    let isPlaying = false;
    let startTime = 0;
    
    const handlePlay = () => {
      try {
        isPlaying = true;
        startTime = Date.now();
        
        const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.innerText || '';
        const isEducationalVideo = isEducational(videoTitle);
        
        const watchTimeInterval = setInterval(() => {
          try {
            if (!isPlaying || !document.querySelector('video')) {
              clearInterval(watchTimeInterval);
              return;
            }
            
            const currentTime = Date.now();
            const watchDuration = (currentTime - startTime) / 1000;
            
            if (isEducationalVideo) {
              stats.watchTime.educational += watchDuration;
            } else {
              stats.watchTime.entertainment += watchDuration;
            }
            
            updateProductivityStats();
            
            startTime = currentTime;
          } catch (error) {
            clearInterval(watchTimeInterval);
            console.log('Watch time interval error:', error);
          }
        }, 1000);
      } catch (error) {
        console.log('Play handler error:', error);
      }
    };
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', () => {
      isPlaying = false;
    });
  } catch (error) {
    console.log('Video tracking setup error:', error);
  }
}

function updateProductivityStats() {
  try {
    const totalWatchTime = stats.watchTime.educational + stats.watchTime.entertainment;
    const educationalPercentage = totalWatchTime > 0 
      ? Math.round((stats.watchTime.educational / totalWatchTime) * 100) 
      : 0;
      
    const watchTimeScore = totalWatchTime > 0 
      ? (stats.watchTime.educational / totalWatchTime) * 60 
      : 0;
    
    const videoRatioScore = stats.totalVideos > 0 
      ? (stats.educationalCount / stats.totalVideos) * 40 
      : 0;
    
    const productivityScore = Math.round(watchTimeScore + videoRatioScore);
    
    // Save stats to local storage first as backup
    chrome.storage.local.set({
      videoStats: {
        ...stats,
        educationalPercentage,
        productivityScore,
        totalVideos: stats.totalVideos,
        lastUpdated: Date.now(),
        scoreBreakdown: {
          watchTimeScore: Math.round(watchTimeScore),
          videoRatioScore: Math.round(videoRatioScore),
          watchTimePercent: totalWatchTime > 0 ? Math.round((stats.watchTime.educational / totalWatchTime) * 100) : 0,
          videoRatioPercent: stats.totalVideos > 0 ? Math.round((stats.educationalCount / stats.totalVideos) * 100) : 0
        }
      }
    });

    // Then try to send message with score breakdown
    chrome.runtime.sendMessage({
      type: 'statsUpdate',
      stats: {
        ...stats,
        educationalPercentage,
        productivityScore,
        totalVideos: stats.totalVideos,
        scoreBreakdown: {
          watchTimeScore: Math.round(watchTimeScore),
          videoRatioScore: Math.round(videoRatioScore),
          watchTimePercent: totalWatchTime > 0 ? Math.round((stats.watchTime.educational / totalWatchTime) * 100) : 0,
          videoRatioPercent: stats.totalVideos > 0 ? Math.round((stats.educationalCount / stats.totalVideos) * 100) : 0
        }
      }
    }, response => {
      if (chrome.runtime.lastError) {
        console.log('Stats update error:', chrome.runtime.lastError);
        // Re-initialize the content script if extension context is invalid
        if (chrome.runtime.lastError.message.includes('Extension context invalidated')) {
          window.location.reload();
        }
      }
    });
  } catch (error) {
    console.log('Stats update error:', error);
    // If extension context is invalid, reload the page
    if (error.message.includes('Extension context invalidated')) {
      window.location.reload();
    }
  }
}

function calculateProductivityScore() {
  const totalWatchTime = stats.watchTime.educational + stats.watchTime.entertainment;
  const watchTimeScore = totalWatchTime > 0 
    ? (stats.watchTime.educational / totalWatchTime) * 60 
    : 0;
    
  const videoRatioScore = stats.totalVideos > 0 
    ? (stats.educationalCount / stats.totalVideos) * 40 
    : 0;
    
  return Math.round(watchTimeScore + videoRatioScore);
}

// Add debounce function at the top with other utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedUpdateStats = debounce(updateProductivityStats, 300);

const processVideo = async (item) => {
  // Mark as processed
  item.setAttribute('data-processed', 'true');
  stats.totalVideos++;
  
  const isAd = item.tagName.toLowerCase().includes('ad') || 
               item.hasAttribute('id') && item.id.toLowerCase().includes('ad') ||
               item.classList.contains('ytd-promoted-video-renderer');

  const isShort = item.tagName.toLowerCase().includes('reel') || 
                 item.tagName.toLowerCase().includes('shorts') ||
                 item.innerHTML.toLowerCase().includes('shorts');

  const textContent = item.innerText;
  const keyword = shouldFilterOut(textContent);
  
  if (isEducational(textContent)) {
    stats.educationalCount++;
  }

  if ((isAd && !isEducational(textContent)) || isShort || (keyword && !isEducational(textContent))) {
    stats.filteredCount++;
    
    // Add transition effect
    item.style.transition = 'opacity 0.3s ease';
    
    // Create and append overlay with animation
    const overlay = document.createElement('div');
    overlay.className = 'focus-filter-overlay';
    overlay.style.cssText = motivationalOverlayStyle + `
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    const message = isAd ? "Focus on content, not ads!" :
                   isShort ? "Think long-term. Skip the Shorts." :
                   getMotivationalMessage(keyword);
    
    overlay.textContent = message;
    
    item.style.position = 'relative';
    item.appendChild(overlay);

    // Hide thumbnail with fade
    const thumbnails = item.querySelectorAll('ytd-channel-renderer img, img#img, yt-image img, ytd-thumbnail img, #thumbnail img');
    thumbnails.forEach(thumbnail => {
      thumbnail.style.transition = 'opacity 0.3s ease';
      thumbnail.style.opacity = '0';
    });

    // Trigger animations
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.transform = 'scale(1)';
        item.style.opacity = '0.3';
        item.style.pointerEvents = 'none';

        setTimeout(() => {
          thumbnails.forEach(thumbnail => {
            thumbnail.style.display = 'none';
          });
          resolve();
        }, 300);
      });
    });
  }
  
  // Use debounced update to prevent too many updates
  debouncedUpdateStats();
};

function applyFilter() {
  if (filterRunning || !isFilterEnabled) return;
  filterRunning = true;

  // Use requestAnimationFrame for smooth animations
  requestAnimationFrame(async () => {
    try {
      // Get only unprocessed videos (those without a data-processed attribute)
      const videoItems = document.querySelectorAll(`
        ytd-rich-item-renderer:not([data-processed]), 
        ytd-video-renderer:not([data-processed]), 
        ytd-grid-video-renderer:not([data-processed]),
        ytd-compact-video-renderer:not([data-processed]),
        ytd-compact-playlist-renderer:not([data-processed]),
        ytd-compact-radio-renderer:not([data-processed]),
        ytd-reel-item-renderer:not([data-processed]),
        ytd-shorts:not([data-processed]),
        ytd-in-feed-ad-layout-renderer:not([data-processed]),
        ytd-promoted-video-renderer:not([data-processed]),
        ytd-display-ad-renderer:not([data-processed])
      `);

      // Process videos one by one
      for (const item of Array.from(videoItems)) {
        await processVideo(item);
        // Small delay between videos for smooth visual feedback
        await new Promise(resolve => setTimeout(resolve, 50));
      }

    } catch (error) {
      console.log('Filter application error:', error);
    } finally {
      filterRunning = false;
    }
  });
}

// Modify observer to use Intersection Observer for scroll detection
function initFilter() {
  try {
    // Check persist stats setting
    chrome.storage.sync.get(['persistStats'], (result) => {
      if (result.persistStats) {
        // If persisting stats, load existing stats instead of resetting
        chrome.storage.local.get(['videoStats'], (statsResult) => {
          if (statsResult.videoStats) {
            stats = { ...statsResult.videoStats };
          } else {
            // Fallback to reset if no stats exist
            stats = {
              filteredCount: 0,
              educationalCount: 0,
              totalVideos: 0,
              watchTime: {
                educational: 0,
                entertainment: 0
              }
            };
          }
          initializeFilter();
        });
      } else {
        // Reset stats when filter is initialized (if not persisting)
        stats = {
          filteredCount: 0,
          educationalCount: 0,
          totalVideos: 0,
          watchTime: {
            educational: 0,
            entertainment: 0
          }
        };
        initializeFilter();
      }
    });

    function initializeFilter() {
      filterRunning = false;
      applyFilter();
      trackVideoWatchTime();

      // Create mutation observer for new content
      const mutationObserver = new MutationObserver(() => {
        if (!filterRunning && isFilterEnabled) {
          applyFilter();
        }
      });

      // Create intersection observer for scroll detection
      const intersectionObserver = new IntersectionObserver((entries) => {
        const processEntries = async () => {
          for (const entry of entries) {
            if (entry.isIntersecting && !entry.target.hasAttribute('data-processed')) {
              await processVideo(entry.target);
            }
          }
        };
        processEntries().catch(error => console.log('Error processing entries:', error));
      }, {
        root: null,
        rootMargin: '100px', // Increased margin for better pre-loading
        threshold: 0.1
      });

      // Observe DOM changes
      mutationObserver.observe(document.body, { 
        childList: true, 
        subtree: true 
      });

      // Function to observe new videos
      const observeNewVideos = () => {
        const unprocessedVideos = document.querySelectorAll(`
          ytd-rich-item-renderer:not([data-processed]), 
          ytd-video-renderer:not([data-processed]),
          ytd-grid-video-renderer:not([data-processed])
        `);
        unprocessedVideos.forEach(video => {
          intersectionObserver.observe(video);
        });
      };

      // Observe initial videos
      observeNewVideos();

      // Add observer for new videos being added
      const newVideoObserver = new MutationObserver(observeNewVideos);
      newVideoObserver.observe(document.body, { childList: true, subtree: true });

      return {
        disconnect: () => {
          mutationObserver.disconnect();
          intersectionObserver.disconnect();
          newVideoObserver.disconnect();
        }
      };
    }
    return null;
  } catch (error) {
    console.log('Init filter error:', error);
    return null;
  }
}

let observer = null;
chrome.storage.sync.get(["distractionFilterEnabled"], result => {
  isFilterEnabled = !!result.distractionFilterEnabled;
  if (result.distractionFilterEnabled) {
    if (window.currentObservers) {
      window.currentObservers.mutation.disconnect();
      window.currentObservers.intersection.disconnect();
      window.currentObservers.newVideo.disconnect();
    }
    initFilter();
  }
});

// Modify chrome.storage.onChanged listener to conditionally clear stats when filter is disabled
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.distractionFilterEnabled) {
    if (changes.distractionFilterEnabled.newValue) {
      isFilterEnabled = true;
      if (window.currentObservers) {
        window.currentObservers.mutation.disconnect();
        window.currentObservers.intersection.disconnect();
        window.currentObservers.newVideo.disconnect();
      }
      initFilter();
    } else {
      isFilterEnabled = false;
      if (window.currentObservers) {
        window.currentObservers.mutation.disconnect();
        window.currentObservers.intersection.disconnect();
        window.currentObservers.newVideo.disconnect();
        window.currentObservers = null;
      }

      // Check persist stats setting before clearing
      chrome.storage.sync.get(['persistStats'], (result) => {
        if (!result.persistStats) {
          // Only clear stats if persist is disabled
          chrome.storage.local.set({
            videoStats: {
              filteredCount: 0,
              educationalCount: 0,
              totalVideos: 0,
              watchTime: {
                educational: 0,
                entertainment: 0
              },
              educationalPercentage: 0,
              productivityScore: 0,
              lastUpdated: Date.now()
            }
          });

          // Reset stats object
          stats = {
            filteredCount: 0,
            educationalCount: 0,
            totalVideos: 0,
            watchTime: {
              educational: 0,
              entertainment: 0
            }
          };

          // Remove overlays and reset styles
          document.querySelectorAll('.focus-filter-overlay').forEach(overlay => {
            overlay.remove();
          });

          document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer').forEach(item => {
            item.style.opacity = '';
            item.style.pointerEvents = '';
            item.removeAttribute('data-processed');

            const thumbnails = item.querySelectorAll('ytd-channel-renderer img, img#img, yt-image img, ytd-thumbnail img, #thumbnail img');
            thumbnails.forEach(thumbnail => {
              thumbnail.style.display = '';
              thumbnail.style.opacity = '';
            });
          });
        } else {
          // If persisting stats, just remove overlays and reset styles without clearing stats
          document.querySelectorAll('.focus-filter-overlay').forEach(overlay => {
            overlay.remove();
          });

          document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer').forEach(item => {
            item.style.opacity = '';
            item.style.pointerEvents = '';
            item.removeAttribute('data-processed');

            const thumbnails = item.querySelectorAll('ytd-channel-renderer img, img#img, yt-image img, ytd-thumbnail img, #thumbnail img');
            thumbnails.forEach(thumbnail => {
              thumbnail.style.display = '';
              thumbnail.style.opacity = '';
            });
          });
        }
      });
    }
  }
});

// Add message listener for toggle updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'toggleFilter') {
    if (message.enabled) {
      // Send response before reloading
      sendResponse({ success: true });
      // Reload the page to start fresh with filter enabled
      window.location.reload();
      return true;
    } else {
      isFilterEnabled = false;
      if (window.currentObservers) {
        window.currentObservers.mutation.disconnect();
        window.currentObservers.intersection.disconnect();
        window.currentObservers.newVideo.disconnect();
        window.currentObservers = null;
      }
      
      // Immediately remove all filter-related styles
      const videoSelectors = `
        ytd-rich-item-renderer, 
        ytd-video-renderer, 
        ytd-grid-video-renderer,
        ytd-compact-video-renderer,
        ytd-compact-playlist-renderer,
        ytd-compact-radio-renderer,
        ytd-reel-item-renderer,
        ytd-shorts,
        ytd-in-feed-ad-layout-renderer,
        ytd-promoted-video-renderer,
        ytd-display-ad-renderer
      `;

      // Remove overlays
      document.querySelectorAll('.focus-filter-overlay').forEach(overlay => {
        overlay.remove();
      });

      // Reset all video item styles
      document.querySelectorAll(videoSelectors).forEach(item => {
        item.style.opacity = '';
        item.style.pointerEvents = '';
        item.style.position = '';
        
        // Reset all thumbnail images
        const thumbnails = item.querySelectorAll('ytd-channel-renderer img, img#img, yt-image img, ytd-thumbnail img, #thumbnail img');
        thumbnails.forEach(thumbnail => {
          thumbnail.style.display = '';
        });
      });
      sendResponse({ success: true });
    }
  }
  return true; // Keep the message channel open for async response
});
