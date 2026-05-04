document.addEventListener('DOMContentLoaded', function () {
  const loaderContainer = document.getElementById('loaderContainer');
  const loaderMessage = loaderContainer.querySelector('.loader-message');
  
  // Array of inspirational messages
  const messages = [
    "Loading your productivity insights...",
    "Preparing to boost your focus...",
    "Getting your learning stats ready...",
    "Making YouTube work better for you...",
    "Calculating your educational progress..."
  ];
  
  // Show random message
  loaderMessage.textContent = messages[Math.floor(Math.random() * messages.length)];

  const toggle = document.getElementById('toggleFilter');
  const persistStatsToggle = document.getElementById('persistStats');
  const filteredCount = document.getElementById('filteredCount');
  const educationalCount = document.getElementById('educationalCount');
  const productivityScore = document.getElementById('productivityScore');
  const totalVideos = document.getElementById('totalVideos');
  const educationalTime = document.getElementById('educationalTime');
  const educationalProgress = document.getElementById('educationalProgress');
  const educationalPercentage = document.getElementById('educationalPercentage');

  // Set a timeout to ensure loader shows for at least 500ms
  const minimumLoaderTime = new Promise(resolve => setTimeout(resolve, 500));

  // Restore last saved state
  chrome.storage.local.get(['lastStats'], result => {
    if (result.lastStats) {
      const stats = result.lastStats;
      // Only restore if stats are less than 1 hour old
      if (Date.now() - stats.timestamp < 3600000) {
        filteredCount.textContent = stats.filteredCount;
        educationalCount.textContent = stats.educationalCount;
        totalVideos.textContent = stats.totalVideos;
        educationalTime.textContent = stats.educationalTime;
        educationalProgress.style.width = `${stats.educationalPercentage}%`;
        educationalPercentage.textContent = `${stats.educationalPercentage}%`;
        productivityScore.textContent = `${stats.productivityScore}%`;
      }
    }
  });

  // Load the current setting and stats
  Promise.all([
    new Promise(resolve => chrome.storage.sync.get(['distractionFilterEnabled', 'persistStats'], resolve)),
    new Promise(resolve => chrome.storage.local.get(['videoStats'], resolve)),
    minimumLoaderTime
  ]).then(([settingsResult, statsResult]) => {
    // Update toggle states
    toggle.checked = !!settingsResult.distractionFilterEnabled;
    persistStatsToggle.checked = !!settingsResult.persistStats;
    
    // Update stats display
    if (statsResult.videoStats) {
      const stats = statsResult.videoStats;
      filteredCount.textContent = stats.filteredCount || 0;
      educationalCount.textContent = stats.educationalCount || 0;
      totalVideos.textContent = stats.totalVideos || 0;
      
      const minutes = Math.round(stats.watchTime?.educational / 60) || 0;
      educationalTime.textContent = `${minutes} min`;
      
      if (stats.educationalPercentage !== undefined) {
        educationalProgress.style.width = `${stats.educationalPercentage}%`;
        educationalPercentage.textContent = `${stats.educationalPercentage}%`;
      }
      
      if (stats.productivityScore !== undefined) {
        productivityScore.textContent = `${stats.productivityScore}%`;
      }
    }
    
    // Hide loader
    loaderContainer.style.opacity = '0';
    setTimeout(() => {
      loaderContainer.style.display = 'none';
    }, 200);
  }).catch(error => {
    console.error('Error loading stats:', error);
    // Hide loader even if there's an error
    loaderContainer.style.display = 'none';
  });
  // Listen for changes to the persist stats toggle
  persistStatsToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ persistStats: persistStatsToggle.checked });
  });
  // Listen for changes to the toggle switch
  toggle.addEventListener("change", () => {
    // Show loader when toggle changes
    loaderContainer.style.display = 'flex';
    loaderMessage.textContent = toggle.checked ? 
      "Enabling focus mode..." : 
      "Disabling focus mode...";

    // Save the new setting
    chrome.storage.sync.set({ 
      distractionFilterEnabled: toggle.checked,
      lastUpdated: Date.now()
    }, () => {
      // If enabling the filter, reload all YouTube tabs
      if (toggle.checked) {
        chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
          if (tabs.length > 0) {
            tabs.forEach(tab => {
              chrome.tabs.reload(tab.id);
            });
          }
          // Hide loader after a short delay
          setTimeout(() => {
            loaderContainer.style.display = 'none';
          }, 500);
        });
      } else {
        // If disabling, check persist stats setting
        chrome.storage.sync.get(['persistStats'], (result) => {
          if (!result.persistStats) {
            // Only reset stats if persist is disabled
            chrome.storage.local.set({
              lastStats: {
                filteredCount: 0,
                educationalCount: 0,
                totalVideos: 0,
                educationalTime: '0 min',
                educationalPercentage: 0,
                productivityScore: 0,
                timestamp: Date.now()
              }
            }, () => {
              chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
                if (tabs.length > 0) {
                  const messagePromises = tabs.map(tab => {
                    return new Promise((resolve) => {
                      chrome.tabs.sendMessage(
                        tab.id, 
                        { type: 'toggleFilter', enabled: false },
                        (response) => {
                          if (chrome.runtime.lastError) {
                            console.log('Tab communication error:', chrome.runtime.lastError);
                          }
                          resolve();
                        }
                      );
                    });
                  });

                  Promise.all(messagePromises).then(() => {
                    // Reset all stats displays to zero
                    filteredCount.textContent = '0';
                    educationalCount.textContent = '0';
                    totalVideos.textContent = '0';
                    educationalTime.textContent = '0 min';
                    educationalProgress.style.width = '0%';
                    educationalPercentage.textContent = '0%';
                    productivityScore.textContent = '0%';

                    // Hide loader after processing
                    setTimeout(() => {
                      loaderContainer.style.display = 'none';
                    }, 500);
                  });
                } else {
                  loaderContainer.style.display = 'none';
                }
              });
            });
          } else {
            // If persisting stats, just notify tabs without resetting
            chrome.tabs.query({ url: "*://*.youtube.com/*" }, (tabs) => {
              if (tabs.length > 0) {
                const messagePromises = tabs.map(tab => {
                  return new Promise((resolve) => {
                    chrome.tabs.sendMessage(
                      tab.id, 
                      { type: 'toggleFilter', enabled: false },
                      (response) => {
                        if (chrome.runtime.lastError) {
                          console.log('Tab communication error:', chrome.runtime.lastError);
                        }
                        resolve();
                      }
                    );
                  });
                });

                Promise.all(messagePromises).then(() => {
                  // Hide loader
                  setTimeout(() => {
                    loaderContainer.style.display = 'none';
                  }, 500);
                });
              } else {
                loaderContainer.style.display = 'none';
              }
            });
          }
        });
      }
    });
  });

  // Listen for storage changes to update stats in real time
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.focusFilterStats) {
      const stats = changes.focusFilterStats.newValue || { filtered: 0, educational: 0, total: 0, productivity: 0 };
      filteredCount.textContent = stats.filtered;
      educationalCount.textContent = stats.educational;
      productivityScore.textContent = stats.productivity + '%';
    }
  });
});

// Update the message listener to handle stats updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'statsUpdate' && message.stats) {
    const stats = message.stats;
    
    // Update existing stats
    filteredCount.textContent = stats.filteredCount || 0;
    educationalCount.textContent = stats.educationalCount || 0;
    totalVideos.textContent = stats.totalVideos || 0;
    
    // Update educational time
    const minutes = Math.round(stats.watchTime?.educational / 60) || 0;
    educationalTime.textContent = `${minutes} min`;
    
    // Update educational percentage
    educationalProgress.style.width = `${stats.educationalPercentage}%`;
    educationalPercentage.textContent = `${stats.educationalPercentage}%`;
    
    // Update productivity score and breakdown
    productivityScore.textContent = `${stats.productivityScore}%`;
  }
});
