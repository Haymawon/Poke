fetch("/.netlify/functions/getData")
  .then(res => res.json())
  .then(data => {
    console.log("Giphy Data:", data.giphy);
    console.log("Pixabay Data:", data.pixabay);
  });
       
// Pixabay API state
        let currentPage = 1;
        let currentQuery = '';
        let currentFilters = {
            category: '',
            image_type: 'all',
            orientation: 'all',
            order: 'popular',
            safesearch: 'true'
        };
        let totalHits = 0;
        let currentImages = [];
        
        document.addEventListener('DOMContentLoaded', function() {
            // Tab navigation functionality
            const tabs = document.querySelectorAll('.tab');
            const sections = document.querySelectorAll('.section');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    const targetSection = this.getAttribute('data-section');
                    
                    // Update active tab
                    tabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Show target section
                    sections.forEach(section => {
                        section.classList.remove('active');
                        if (section.id === targetSection) {
                            section.classList.add('active');
                            
                            // Load content for the section if needed
                            if (targetSection === 'loopies') {
                                loadTrendingGIFs();
                            } else if (targetSection === 'peek') {
                                loadPixabayImages();
                            }
                        }
                    });
                });
            });
            
            // Get Started button
            const getStartedBtn = document.querySelector('.get-started-btn');
            if (getStartedBtn) {
                getStartedBtn.addEventListener('click', function() {
                    document.querySelector('[data-section="loopies"]').click();
                });
            }
            
            // GIF Search functionality
            const searchInput = document.querySelector('.search-input');
            const categoryButtons = document.querySelectorAll('.category-btn');
            let searchTimeout = null;
            
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (this.value.trim() === '') {
                        loadTrendingGIFs();
                    } else {
                        searchGIFs(this.value);
                    }
                }, 500);
            });
            
            categoryButtons.forEach(button => {
                button.addEventListener('click', function() {
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    const category = this.getAttribute('data-category');
                    
                    if (category === 'trending') {
                        loadTrendingGIFs();
                    } else {
                        searchGIFs(category);
                    }
                });
            });
            
            // Pixabay search functionality
            const pixabaySearch = document.getElementById('pixabay-search');
            const pixabaySearchBtn = document.getElementById('pixabay-search-btn');
            const categoryFilter = document.getElementById('category-filter');
            const typeFilter = document.getElementById('type-filter');
            const orientationFilter = document.getElementById('orientation-filter');
            const orderFilter = document.getElementById('order-filter');
            const safesearchFilter = document.getElementById('safesearch-filter');
            const loadMoreBtn = document.getElementById('load-more');
            
            // Search on button click
            pixabaySearchBtn.addEventListener('click', () => {
                currentPage = 1;
                loadPixabayImages();
            });
            
            // Search on Enter key
            pixabaySearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    currentPage = 1;
                    loadPixabayImages();
                }
            });
            
            // Filter change handlers
            categoryFilter.addEventListener('change', () => {
                currentPage = 1;
                currentFilters.category = categoryFilter.value;
                loadPixabayImages();
            });
            
            typeFilter.addEventListener('change', () => {
                currentPage = 1;
                currentFilters.image_type = typeFilter.value;
                loadPixabayImages();
            });
            
            orientationFilter.addEventListener('change', () => {
                currentPage = 1;
                currentFilters.orientation = orientationFilter.value;
                loadPixabayImages();
            });
            
            orderFilter.addEventListener('change', () => {
                currentPage = 1;
                currentFilters.order = orderFilter.value;
                loadPixabayImages();
            });
            
            safesearchFilter.addEventListener('change', () => {
                currentPage = 1;
                currentFilters.safesearch = safesearchFilter.value;
                loadPixabayImages();
            });
            
            // Load more button
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                loadPixabayImages(true);
            });
            
            // Load trending GIFs
            function loadTrendingGIFs() {
                const gifGrid = document.querySelector('.gif-grid');
                gifGrid.innerHTML = '<div class="loading">Loading trending GIFs...</div>';
                
                fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=50&rating=g`)
                    .then(response => response.json())
                    .then(data => {
                        renderGIFs(data.data);
                    })
                    .catch(error => {
                        console.error('Error fetching trending GIFs:', error);
                        gifGrid.innerHTML = '<div class="loading">Failed to load GIFs. Please try again later.</div>';
                    });
            }
            
            // Search GIFs
            function searchGIFs(query) {
                const gifGrid = document.querySelector('.gif-grid');
                gifGrid.innerHTML = '<div class="loading">Searching for "' + query + '"...</div>';
                
                fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=50&rating=g`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.data.length === 0) {
                            gifGrid.innerHTML = '<div class="loading">No loopies found. Try another vibe ✨</div>';
                        } else {
                            renderGIFs(data.data);
                        }
                    })
                    .catch(error => {
                        console.error('Error searching GIFs:', error);
                        gifGrid.innerHTML = '<div class="loading">Failed to search GIFs. Please try again later.</div>';
                    });
            }
            
            // Render GIFs to the grid
            function renderGIFs(gifs) {
                const gifGrid = document.querySelector('.gif-grid');
                
                let html = '';
                
                gifs.forEach(gif => {
                    // Calculate file size approximation
                    const size = Math.round(gif.images.original.size / 1024);
                    
                    html += `
                    <div class="gif-card">
                        <img src="${gif.images.fixed_height.url}" alt="${gif.title}" class="gif-image">
                        <div class="gif-info">
                            <h3 class="gif-title">${gif.title || 'Untitled GIF'}</h3>
                            <div class="gif-meta">
                                <span>${size} KB</span>
                                <span>GIF</span>
                            </div>
                            <div class="gif-actions">
                                <button class="action-btn" onclick="copyLink('${gif.images.original.url}')">
                                    🔗 Copy
                                </button>
                                <button class="action-btn" onclick="shareGIF('${gif.title}', '${gif.url}')">
                                    📤 Share
                                </button>
                            </div>
                        </div>
                    </div>
                    `;
                });
                
                gifGrid.innerHTML = html;
            }
            
            // Load Pixabay images
            function loadPixabayImages(append = false) {
                const galleryGrid = document.getElementById('pixabay-gallery');
                const loadMoreBtn = document.getElementById('load-more');
                const resultsCount = document.querySelector('.results-count');
                
                if (!append) {
                    galleryGrid.innerHTML = '<div class="loading">Loading images from Pixabay...</div>';
                    loadMoreBtn.style.display = 'none';
                }
                
                currentQuery = pixabaySearch.value.trim();
                
                // Build query parameters
                const params = new URLSearchParams({
                    key: PIXABAY_API_KEY,
                    q: currentQuery || '',
                    page: currentPage,
                    per_page: 20
                });
                
                // Add filters
                if (currentFilters.category) params.append('category', currentFilters.category);
                if (currentFilters.image_type !== 'all') params.append('image_type', currentFilters.image_type);
                if (currentFilters.orientation !== 'all') params.append('orientation', currentFilters.orientation);
                if (currentFilters.order) params.append('order', currentFilters.order);
                if (currentFilters.safesearch) params.append('safesearch', currentFilters.safesearch);
                
                fetch(`https://pixabay.com/api/?${params}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.hits && data.hits.length > 0) {
                            totalHits = data.totalHits;
                            if (append) {
                                currentImages = [...currentImages, ...data.hits];
                            } else {
                                currentImages = data.hits;
                            }
                            renderPixabayImages();
                            // Update results count in Peek a Pics section
                            const peekSection = document.getElementById('peek');
                            if (peekSection) {
                                const countSpan = peekSection.querySelector('.results-count');
                                if (countSpan) countSpan.textContent = currentImages.length;
                            }
                            // Show load more button if there are more results
                            if (currentImages.length < totalHits) {
                                loadMoreBtn.style.display = 'block';
                            } else {
                                loadMoreBtn.style.display = 'none';
                            }
                        } else {
                            if (!append) {
                                galleryGrid.innerHTML = '<div class="error-message">No images found. Try a different search.</div>';
                            }
                            loadMoreBtn.style.display = 'none';
                            // Also update results count to 0
                            const peekSection = document.getElementById('peek');
                            if (peekSection) {
                                const countSpan = peekSection.querySelector('.results-count');
                                if (countSpan) countSpan.textContent = 0;
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching Pixabay images:', error);
                        galleryGrid.innerHTML = '<div class="error-message">Failed to load images. Please try again later.</div>';
                        loadMoreBtn.style.display = 'none';
                        // Also update results count to 0
                        const peekSection = document.getElementById('peek');
                        if (peekSection) {
                            const countSpan = peekSection.querySelector('.results-count');
                            if (countSpan) countSpan.textContent = 0;
                        }
                    });
            }
            
            // Render Pixabay images to the gallery
            function renderPixabayImages() {
                const galleryGrid = document.getElementById('pixabay-gallery');
                
                let html = '';
                
                currentImages.forEach((image, index) => {
                    html += `
                    <div class="gallery-item" data-index="${index}">
                        <img src="${image.webformatURL}" alt="${image.tags}" class="gallery-image">
                        <div class="gallery-item-info">
                            <div class="gallery-item-tags">${image.tags}</div>
                            <div class="gallery-item-meta">
                                <div class="gallery-item-user">
                                    <img src="${image.userImageURL || 'https://cdn.pixabay.com/user/2019/05/15/10-26-09-781_250x250.jpg'}" alt="${image.user}" class="user-avatar">
                                    <span>${image.user}</span>
                                </div>
                                <div>
                                    <span>❤️ ${image.likes}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                });
                
                galleryGrid.innerHTML = html;
                
                // Set up lightbox for gallery images
                setupPixabayLightbox();
            }
            
            // Lightbox functionality for Pixabay images
            function setupPixabayLightbox() {
                const galleryItems = document.querySelectorAll('.gallery-item');
                const lightbox = document.getElementById('lightbox');
                const lightboxImage = document.getElementById('lightbox-image');
                const lightboxCaption = document.getElementById('lightbox-caption');
                const lightboxClose = document.getElementById('lightbox-close');
                const lightboxPrev = document.getElementById('lightbox-prev');
                const lightboxNext = document.getElementById('lightbox-next');
                
                let currentImageIndex = 0;
                
                galleryItems.forEach((item, index) => {
                    item.addEventListener('click', () => {
                        currentImageIndex = index;
                        openLightbox();
                    });
                });
                
                function openLightbox() {
                    const image = currentImages[currentImageIndex];
                    lightboxImage.src = image.largeImageURL;
                    lightboxCaption.textContent = image.tags;
                    
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
                
                function closeLightbox() {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
                
                function showNextImage() {
                    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
                    openLightbox();
                }
                
                function showPrevImage() {
                    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
                    openLightbox();
                }
                
                lightboxClose.addEventListener('click', closeLightbox);
                lightboxNext.addEventListener('click', showNextImage);
                lightboxPrev.addEventListener('click', showPrevImage);
                
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) {
                        closeLightbox();
                    }
                });
                
                // Keyboard navigation for lightbox
                document.addEventListener('keydown', (e) => {
                    if (lightbox.classList.contains('active')) {
                        if (e.key === 'Escape') closeLightbox();
                        if (e.key === 'ArrowRight') showNextImage();
                        if (e.key === 'ArrowLeft') showPrevImage();
                    }
                });
            }
            
            // Copy link functionality
            window.copyLink = function(url) {
                navigator.clipboard.writeText(url).then(() => {
                    showToast('Link copied!');
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    showToast('Failed to copy link');
                });
            };
            
            // Share functionality
            window.shareGIF = function(title, url) {
                if (navigator.share) {
                    navigator.share({
                        title: 'DoYouEvenGif',
                        text: 'Check this loop: ' + title,
                        url: url
                    }).catch(err => {
                        console.error('Error sharing:', err);
                        showToast('Sharing failed');
                    });
                } else {
                    showToast('Web Share API not supported in your browser');
                }
            };
            
            // Show toast message
            function showToast(message) {
                const toast = document.getElementById('toast');
                toast.textContent = message;
                toast.classList.add('active');
                
                setTimeout(() => {
                    toast.classList.remove('active');
                }, 2000);
            }
            
            // Load trending GIFs initially if on Loopies section
            if (document.querySelector('#loopies').classList.contains('active')) {
                loadTrendingGIFs();
            }
            
            // Load Pixabay images initially if on Peek a Pics section
            if (document.querySelector('#peek').classList.contains('active')) {
                loadPixabayImages();
            }
        });

      

       // iTunes API functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Tunes tab functionality
        const tunesTab = document.querySelector('[data-section="tunes"]');
        const tunesSection = document.getElementById('tunes');
        
        // Check if Tunes section is active on page load
        if (tunesSection.classList.contains('active')) {
            loadDefaultTunes();
        }
        
        // Load default content when tab is clicked
        if (tunesTab) {
            tunesTab.addEventListener('click', function() {
                const tunesGrid = document.getElementById('tunes-grid');
                if (tunesGrid.children.length <= 1) { // Only loading element or empty
                    loadDefaultTunes();
                }
            });
        }
        
        // iTunes search elements
        const itunesSearch = document.getElementById('itunes-search');
        const itunesSearchBtn = document.getElementById('itunes-search-btn');
        const mediaFilter = document.getElementById('media-filter');
        const entityFilter = document.getElementById('entity-filter');
        const countryFilter = document.getElementById('country-filter');
        const resultsFilter = document.getElementById('results-filter');
        const loadMoreTunesBtn = document.getElementById('load-more-tunes');
        const tunesGrid = document.getElementById('tunes-grid');
        const resultsCount = document.querySelector('.results-count');
        
        let itunesOffset = 0;
        let currentItunesQuery = '';
        let currentItunesFilters = {
            media: 'all',
            entity: '',
            country: 'US',
            limit: '50'
        };
        let totalResults = 0;
        
        // Load default trending music
        function loadDefaultTunes() {
            tunesGrid.innerHTML = '<div class="loading">Loading trending music...</div>';
            
            // Randomize trending music from your favorite artists
            const defaultArtists = [
                'Billie Eilish',
                'SZA',
                'Chappell Roan',
                'lorde',
                'Dua Lipa',
                'Ariana Grande',
                'Ed Sheeran',
                'Bruno Mars',
                'Olivia Rodrigo',
                'Doja Cat',
            ];
            const randomArtist = defaultArtists[Math.floor(Math.random() * defaultArtists.length)];
            const params = new URLSearchParams({
                term: randomArtist,
                media: 'music',
                country: 'US',
                limit: '30',
                explicit: 'No'
            });
            
            fetch(`https://itunes.apple.com/search?${params}`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        renderItunesResults(data.results, false);
                        resultsCount.textContent = data.results.length;
                        document.querySelector('.results-info').innerHTML = 
                            `Showing <span class="results-count">${data.results.length}</span> trending results`;
                    } else {
                        tunesGrid.innerHTML = '<div class="no-results">No trending music found. Try a search instead.</div>';
                    }
                })
                .catch(error => {
                    console.error('Error fetching trending music:', error);
                    tunesGrid.innerHTML = '<div class="no-results">Failed to load trending music. Please try again later.</div>';
                });
        }
        
        // Search on button click
        itunesSearchBtn.addEventListener('click', () => {
            itunesOffset = 0;
            performItunesSearch();
        });
        
        // Search on Enter key
        itunesSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                itunesOffset = 0;
                performItunesSearch();
            }
        });
        
        // Filter change handlers
        mediaFilter.addEventListener('change', () => {
            itunesOffset = 0;
            currentItunesFilters.media = mediaFilter.value;
            updateEntityOptions();
            performItunesSearch();
        });
        
        entityFilter.addEventListener('change', () => {
            itunesOffset = 0;
            currentItunesFilters.entity = entityFilter.value;
            performItunesSearch();
        });
        
        countryFilter.addEventListener('change', () => {
            itunesOffset = 0;
            currentItunesFilters.country = countryFilter.value;
            performItunesSearch();
        });
        
        resultsFilter.addEventListener('change', () => {
            itunesOffset = 0;
            currentItunesFilters.limit = resultsFilter.value;
            performItunesSearch();
        });
        
        // Load more button
        loadMoreTunesBtn.addEventListener('click', () => {
            itunesOffset += parseInt(currentItunesFilters.limit);
            performItunesSearch(true);
        });
        
        // Update entity options based on media type
        function updateEntityOptions() {
            const mediaType = currentItunesFilters.media;
            const entitySelect = document.getElementById('entity-filter');
            
            // Save current value
            const currentValue = entitySelect.value;
            
            // Define entities for each media type
            const entities = {
                'all': [
                    {value: '', text: 'Auto'},
                    {value: 'movie', text: 'Movies'},
                    {value: 'podcast', text: 'Podcasts'},
                    {value: 'music', text: 'Music'},
                    {value: 'musicVideo', text: 'Music Videos'},
                    {value: 'audiobook', text: 'Audiobooks'},
                    {value: 'shortFilm', text: 'Short Films'},
                    {value: 'tvShow', text: 'TV Shows'},
                    {value: 'software', text: 'Software'},
                    {value: 'ebook', text: 'eBooks'}
                ],
                'music': [
                    {value: '', text: 'Auto'},
                    {value: 'musicArtist', text: 'Artists'},
                    {value: 'musicTrack', text: 'Tracks'},
                    {value: 'album', text: 'Albums'},
                    {value: 'musicVideo', text: 'Music Videos'},
                    {value: 'mix', text: 'Mixes'},
                    {value: 'song', text: 'Songs'}
                ],
                'podcast': [
                    {value: '', text: 'Auto'},
                    {value: 'podcastAuthor', text: 'Authors'},
                    {value: 'podcast', text: 'Podcasts'}
                ],
                'audiobook': [
                    {value: '', text: 'Auto'},
                    {value: 'audiobookAuthor', text: 'Authors'},
                    {value: 'audiobook', text: 'Audiobooks'}
                ],
                'musicVideo': [
                    {value: '', text: 'Auto'},
                    {value: 'musicArtist', text: 'Artists'},
                    {value: 'musicVideo', text: 'Music Videos'}
                ]
            };
            
            // Get appropriate entities or use all as default
            const options = entities[mediaType] || entities['all'];
            
            // Clear existing options
            entitySelect.innerHTML = '';
            
            // Add new options
            options.forEach(option => {
                const optElement = document.createElement('option');
                optElement.value = option.value;
                optElement.textContent = option.text;
                entitySelect.appendChild(optElement);
            });
            
            // Try to restore previous value if it exists in new options
            if (options.some(opt => opt.value === currentValue)) {
                entitySelect.value = currentValue;
            } else {
                entitySelect.value = '';
            }
            
            currentItunesFilters.entity = entitySelect.value;
        }
        
        // Perform iTunes search
        function performItunesSearch(append = false) {
            currentItunesQuery = itunesSearch.value.trim();
            
            if (!append) {
                tunesGrid.innerHTML = '<div class="loading">Searching iTunes...</div>';
                loadMoreTunesBtn.style.display = 'none';
            }
            
            // Build query parameters
            const params = new URLSearchParams({
                term: currentItunesQuery || 'music',
                media: currentItunesFilters.media,
                country: currentItunesFilters.country,
                limit: currentItunesFilters.limit,
                offset: itunesOffset.toString()
            });
            
            if (currentItunesFilters.entity) {
                params.append('entity', currentItunesFilters.entity);
            }
            
            // Add explicit content filter (set to "No" for family-friendly results)
            params.append('explicit', 'No');
            
            const apiUrl = `https://itunes.apple.com/search?${params}`;
            
            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.results && data.results.length > 0) {
                        totalResults = data.resultCount;
                        renderItunesResults(data.results, append);
                        resultsCount.textContent = data.results.length;
                        
                        // Update results info text
                        if (currentItunesQuery) {
                            document.querySelector('.results-info').innerHTML = 
                                `Showing <span class="results-count">${data.results.length}</span> of ${totalResults.toLocaleString()} results for "${currentItunesQuery}"`;
                        } else {
                            document.querySelector('.results-info').innerHTML = 
                                `Showing <span class="results-count">${data.results.length}</span> of ${totalResults.toLocaleString()} results`;
                        }
                        
                        // Show load more button if there might be more results
                        if (data.results.length >= parseInt(currentItunesFilters.limit) && 
                            (itunesOffset + parseInt(currentItunesFilters.limit)) < totalResults) {
                            loadMoreTunesBtn.style.display = 'block';
                        } else {
                            loadMoreTunesBtn.style.display = 'none';
                        }
                    } else {
                        if (!append) {
                            tunesGrid.innerHTML = '<div class="no-results">No results found. Try a different search.</div>';
                            document.querySelector('.results-info').innerHTML = 
                                `Showing <span class="results-count">0</span> results` +
                                (currentItunesQuery ? ` for "${currentItunesQuery}"` : '');
                        }
                        loadMoreTunesBtn.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Error fetching iTunes results:', error);
                    tunesGrid.innerHTML = '<div class="no-results">Failed to search. Please try again later.</div>';
                    loadMoreTunesBtn.style.display = 'none';
                });
        }
        
        // Render iTunes results
        function renderItunesResults(results, append = false) {
            // Deduplicate results by trackId (or collectionId if no trackId)
            const seen = new Set();
            let html = '';
            results.forEach(item => {
                const uniqueId = item.trackId || item.collectionId || item.artistId || Math.random();
                if (seen.has(uniqueId)) return;
                seen.add(uniqueId);
                const type = item.wrapperType || 'track';
                let mediaType = 'unknown';
                // Get appropriate image
                const artworkUrl = item.artworkUrl100 || item.artworkUrl60 || '';
                const highResArtwork = artworkUrl.replace('100x100', '400x400').replace('60x60', '400x400');
                // Format date
                let releaseDate = '';
                if (item.releaseDate) {
                    const date = new Date(item.releaseDate);
                    releaseDate = date.toLocaleDateString();
                }
                // Determine what links to show
                const hasPreview = item.previewUrl;
                const trackId = item.trackId;
                const trackName = item.trackName || item.collectionName || item.artistName;
                const artistName = item.artistName;
                // Generate Spotify search URL
                const spotifyQuery = encodeURIComponent(`${trackName} ${artistName}`);
                const spotifyUrl = `https://open.spotify.com/search/${spotifyQuery}`;
                // Generate Apple Music URL
                const appleMusicUrl = item.trackViewUrl || item.collectionViewUrl || item.artistViewUrl || '#';
                html += `
                <div class="tune-card" data-id="${item.trackId || item.collectionId}">
                    <div class="tune-image-container">
                        <img src="${highResArtwork}" alt="${trackName}" class="tune-image" onerror="this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22400%22 height%3D%22400%22 viewBox%3D%220 0 400 400%22%3E%3Crect fill%3D%22%23F6F7FB%22 width%3D%22400%22 height%3D%22400%22%2F%3E%3Ctext fill%3D%22%235E6C7B%22 font-family%3D%22Montserrat%22 font-size%3D%2220%22 dy%3D%22.3em%22 text-anchor%3D%22middle%22 x%3D%22200%22 y%3D%22200%22%3E${encodeURIComponent(trackName.substring(0, 30))}%3C%2Ftext%3E%3C%2Fsvg%3E'">
                        ${hasPreview ? `
                            <button class="tune-play-btn" data-preview="${item.previewUrl}" data-title="${trackName}" data-artist="${artistName}">
                                ▶️
                            </button>
                        ` : ''}
                    </div>
                    <div class="tune-info">
                        <h3 class="tune-title">${trackName}</h3>
                        <div class="tune-artist">${artistName}</div>
                        
                        ${item.collectionName ? `<div class="tune-album">Album: ${item.collectionName}</div>` : ''}
                        ${releaseDate ? `<div class="tune-date">Released: ${releaseDate}</div>` : ''}
                        
                        ${item.description ? `
                            <div class="tune-description">${item.description.replace(/<[^>]*>/g, '').substring(0, 150)}...</div>
                        ` : ''}
                        
                        ${hasPreview ? `
                            <div class="tune-audio-container">
                                <audio class="tune-audio" id="audio-${item.trackId}" preload="none">
                                    <source src="${item.previewUrl}" type="audio/mp4">
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        ` : ''}
                        
                        <div class="tune-actions">
                            ${hasPreview ? `
                                <button class="tune-action-btn listen-btn" data-audio="audio-${item.trackId}">
                                    Preview
                                </button>
                            ` : ''}
                            
                            <a href="${appleMusicUrl}" target="_blank" class="tune-action-btn itunes">
                                <img src="assets/pics/iTunes.png" alt="iTunes" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;"> iTunes
                            </a>
                            
                            <a href="${spotifyUrl}" target="_blank" class="tune-action-btn spotify">
                                 <img src="assets/pics/Spotify.png" alt="iTunes" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;"> Spotify
                            </a>
                        </div>
                    </div>
                </div>
                `;
            });
            
            if (append) {
                tunesGrid.innerHTML += html;
            } else {
                tunesGrid.innerHTML = html;
            }
            
            // Set up event listeners for audio playback
            setupAudioPlayback();
        }
        
        // Set up audio playback functionality
        function setupAudioPlayback() {
            let currentlyPlaying = null;
            
            // Play buttons
            const playButtons = document.querySelectorAll('.tune-play-btn');
            playButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const previewUrl = this.getAttribute('data-preview');
                    const audioId = `audio-${this.parentElement.parentElement.getAttribute('data-id')}`;
                    const audioElement = document.getElementById(audioId);
                    
                    if (currentlyPlaying && currentlyPlaying !== audioElement) {
                        // Pause other audio
                        currentlyPlaying.pause();
                        currentlyPlaying.currentTime = 0;
                        document.querySelectorAll('.tune-play-btn.playing').forEach(btn => {
                            btn.classList.remove('playing');
                            btn.innerHTML = '▶️';
                        });
                    }
                    
                    if (audioElement.paused) {
                        audioElement.play();
                        this.classList.add('playing');
                        this.innerHTML = '⏸️';
                        currentlyPlaying = audioElement;
                    } else {
                        audioElement.pause();
                        this.classList.remove('playing');
                        this.innerHTML = '▶️';
                        currentlyPlaying = null;
                    }
                    
                    // Update when audio ends
                    audioElement.onended = function() {
                        button.classList.remove('playing');
                        button.innerHTML = '▶️';
                        currentlyPlaying = null;
                    };
                });
            });
            
            // Listen buttons
            const listenButtons = document.querySelectorAll('.listen-btn');
            listenButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const audioId = this.getAttribute('data-audio');
                    const audioElement = document.getElementById(audioId);
                    const card = this.closest('.tune-card');
                    const playButton = card.querySelector('.tune-play-btn');
                    
                    if (currentlyPlaying && currentlyPlaying !== audioElement) {
                        currentlyPlaying.pause();
                        currentlyPlaying.currentTime = 0;
                        document.querySelectorAll('.tune-play-btn.playing').forEach(btn => {
                            btn.classList.remove('playing');
                            btn.innerHTML = '▶️';
                        });
                    }
                    
                    if (audioElement.paused) {
                        audioElement.play();
                        if (playButton) {
                            playButton.classList.add('playing');
                            playButton.innerHTML = '⏸️';
                        }
                        currentlyPlaying = audioElement;
                    } else {
                        audioElement.pause();
                        if (playButton) {
                            playButton.classList.remove('playing');
                            playButton.innerHTML = '▶️';
                        }
                        currentlyPlaying = null;
                    }
                    
                    audioElement.onended = function() {
                        if (playButton) {
                            playButton.classList.remove('playing');
                            playButton.innerHTML = '▶️';
                        }
                        currentlyPlaying = null;
                    };
                });
            });
        }
        
        // Initialize entity options based on default media type
        updateEntityOptions();
        
        // Load default content if Tunes is active on page load
        if (tunesSection.classList.contains('active')) {
            loadDefaultTunes();
        }
    });

     // Pokémon API functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Poké tab functionality
        const pokeTab = document.querySelector('[data-section="poke"]');
        const pokeSection = document.getElementById('poke');
        
        // Pokémon search elements
        const pokemonSearch = document.getElementById('pokemon-search');
        const pokemonSearchBtn = document.getElementById('pokemon-search-btn');
        const pokemonContainer = document.getElementById('pokemon-container');
        const pokemonNameElement = document.getElementById('pokemon-name');
        const quizSection = document.getElementById('quiz-section');
        
        // Search on button click
        pokemonSearchBtn.addEventListener('click', () => {
            performPokemonSearch();
        });
        
        // Search on Enter key
        pokemonSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performPokemonSearch();
            }
        });
        
        // Perform Pokémon search
        function performPokemonSearch() {
            const query = pokemonSearch.value.trim().toLowerCase();
            
            if (!query) {
                pokemonContainer.innerHTML = '<div class="no-results">Please enter a Pokémon name or ID</div>';
                return;
            }
            
            pokemonContainer.innerHTML = '<div class="loading"><div class="pokeball-loading"></div><p>Searching for Pokémon...</p></div>';
            
            fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Pokémon not found');
                    }
                    return response.json();
                })
                .then(pokemonData => {
                    // Fetch species data for evolution chain
                    return fetch(pokemonData.species.url)
                        .then(response => response.json())
                        .then(speciesData => {
                            return { pokemon: pokemonData, species: speciesData };
                        });
                })
                .then(data => {
                    const { pokemon, species } = data;
                    
                    // Fetch evolution chain if available
                    if (species.evolution_chain && species.evolution_chain.url) {
                        return fetch(species.evolution_chain.url)
                            .then(response => response.json())
                            .then(evolutionData => {
                                return { pokemon, species, evolution: evolutionData };
                            });
                    } else {
                        return { pokemon, species, evolution: null };
                    }
                })
                .then(data => {
                    renderPokemonData(data);
                    pokemonNameElement.textContent = data.pokemon.name.charAt(0).toUpperCase() + data.pokemon.name.slice(1);
                    
                    // Show quiz section after loading a Pokémon
                    quizSection.style.display = 'block';
                    setupQuiz();
                })
                .catch(error => {
                    console.error('Error fetching Pokémon data:', error);
                    pokemonContainer.innerHTML = '<div class="no-results">Pokémon not found. Please try another name or ID.</div>';
                    quizSection.style.display = 'none';
                });
        }
        
        // Render Pokémon data
        function renderPokemonData(data) {
            const { pokemon, species, evolution } = data;
            
            // Get English description
            let description = 'No description available.';
            const flavorTextEntries = species.flavor_text_entries || [];
            for (let entry of flavorTextEntries) {
                if (entry.language.name === 'en') {
                    description = entry.flavor_text.replace(/\f/g, ' ');
                    break;
                }
            }
            
            // Format height and weight
            const heightInMeters = pokemon.height / 10;
            const weightInKg = pokemon.weight / 10;
            
            // Create HTML for Pokémon data
            let html = `
            <div class="pokemon-card">
                <div class="pokemon-header">
                    <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon-image">
                    <div class="pokemon-basic-info">
                        <h2 class="pokemon-name">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
                        <div class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</div>
                        <div class="pokemon-types">
            `;
            
            // Add type badges
            pokemon.types.forEach(type => {
                html += `<span class="type-badge type-${type.type.name}">${type.type.name}</span>`;
            });
            
            html += `
                        </div>
                    </div>
                </div>
                
                <div class="pokemon-details">
                    <div class="detail-section">
                        <h3 class="detail-title">Physical Stats</h3>
                        <div class="physical-stats">
                            <div class="stat-item">
                                <div class="stat-value">${heightInMeters}m</div>
                                <div class="stat-label">Height</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${weightInKg}kg</div>
                                <div class="stat-label">Weight</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${species.base_happiness || 'N/A'}</div>
                                <div class="stat-label">Base Happiness</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${species.capture_rate || 'N/A'}</div>
                                <div class="stat-label">Capture Rate</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3 class="detail-title">Abilities</h3>
                        <div class="abilities-list">
            `;
            
            // Add abilities
            pokemon.abilities.forEach(ability => {
                const abilityName = ability.ability.name.replace('-', ' ');
                html += `<div class="ability-item">${abilityName} ${ability.is_hidden ? '(Hidden)' : ''}</div>`;
            });
            
            html += `
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3 class="detail-title">Base Stats</h3>
                        <div class="stats-container">
            `;
            
            // Add stats with bars
            pokemon.stats.forEach(stat => {
                const statName = stat.stat.name.replace('-', ' ');
                const statValue = stat.base_stat;
                const statPercentage = Math.min(100, (statValue / 255) * 100);
                
                html += `
                            <div class="stat-row">
                                <span class="stat-name">${statName}</span>
                                <div class="stat-bar-container">
                                    <div class="stat-bar" style="width: ${statPercentage}%;"></div>
                                </div>
                                <span class="stat-value-number">${statValue}</span>
                            </div>
                `;
            });
            
            html += `
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3 class="detail-title">Sprites</h3>
                        <div class="sprites-container">
                            <div class="sprite-item">
                                <img src="${pokemon.sprites.front_default}" alt="Front Default" class="sprite-image">
                                <div class="sprite-label">Front</div>
                            </div>
                            <div class="sprite-item">
                                <img src="${pokemon.sprites.back_default}" alt="Back Default" class="sprite-image">
                                <div class="sprite-label">Back</div>
                            </div>
                            <div class="sprite-item">
                                <img src="${pokemon.sprites.front_shiny}" alt="Front Shiny" class="sprite-image">
                                <div class="sprite-label">Front Shiny</div>
                            </div>
                            <div class="sprite-item">
                                <img src="${pokemon.sprites.back_shiny}" alt="Back Shiny" class="sprite-image">
                                <div class="sprite-label">Back Shiny</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3 class="detail-title">Moves</h3>
                        <div class="moves-container">
            `;
            
            // Add moves (limit to 20)
            const moves = pokemon.moves.slice(0, 20);
            moves.forEach(move => {
                const moveName = move.move.name.replace('-', ' ');
                html += `<div class="move-item">${moveName}</div>`;
            });
            
            if (pokemon.moves.length > 20) {
                html += `<div class="move-item">+${pokemon.moves.length - 20} more</div>`;
            }
            
            html += `
                        </div>
                    </div>
                </div>
            </div>
            `;
            
            // Add evolution chain if available
            if (evolution) {
                html += `
                <div class="pokemon-card">
                    <div class="detail-section">
                        <h3 class="detail-title">Evolution Chain</h3>
                        <div class="evolution-chain" id="evolution-chain">
                `;
                
                const evolutionChain = parseEvolutionChain(evolution.chain);
                html += renderEvolutionChain(evolutionChain);
                
                html += `
                        </div>
                    </div>
                </div>
                `;
            }
            
            pokemonContainer.innerHTML = html;
            
            // Add event listeners to evolution images
            const evolutionImages = document.querySelectorAll('.evolution-image');
            evolutionImages.forEach(img => {
                img.addEventListener('click', function() {
                    const pokemonName = this.getAttribute('data-name');
                    pokemonSearch.value = pokemonName;
                    performPokemonSearch();
                });
            });
        }
        
        // Parse evolution chain
        function parseEvolutionChain(chain) {
            const evolutionChain = [];
            let current = chain;
            
            while (current) {
                const speciesName = current.species.name;
                const speciesId = current.species.url.split('/').slice(-2, -1)[0];
                
                evolutionChain.push({
                    name: speciesName,
                    id: speciesId,
                    evolves_to: []
                });
                
                if (current.evolves_to && current.evolves_to.length > 0) {
                    // For simplicity, we'll just take the first evolution path
                    current = current.evolves_to[0];
                } else {
                    break;
                }
            }
            
            return evolutionChain;
        }
        
        // Render evolution chain
        function renderEvolutionChain(chain) {
            let html = '';
            
            for (let i = 0; i < chain.length; i++) {
                if (i > 0) {
                    html += `<div class="evolution-arrow">→</div>`;
                }
                
                html += `
                <div class="evolution-stage">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${chain[i].id}.png" 
                         alt="${chain[i].name}" 
                         class="evolution-image"
                         data-name="${chain[i].name}">
                    <div class="evolution-name">${chain[i].name.charAt(0).toUpperCase() + chain[i].name.slice(1)}</div>
                </div>
                `;
            }
            
            return html;
        }
        
        // Quiz functionality
        function setupQuiz() {
            const quizOptions = document.querySelectorAll('.quiz-option');
            const quizFeedback = document.getElementById('quiz-feedback');
            const nextQuestionBtn = document.getElementById('next-question');
            
            // Simple Pokémon quiz questions
            const quizQuestions = [
                {
                    question: "Which type is super effective against Water-type Pokémon?",
                    options: ["Fire", "Electric", "Grass", "Ground"],
                    correct: 2 // Grass
                },
                {
                    question: "What is Pikachu's evolution called?",
                    options: ["Raichu", "Pikachu2", "Super Pikachu", "Pikachu doesn't evolve"],
                    correct: 0 // Raichu
                },
                {
                    question: "Which of these is a Fire-type Pokémon?",
                    options: ["Squirtle", "Charmander", "Bulbasaur", "Pidgey"],
                    correct: 1 // Charmander
                }
            ];
            
            let currentQuestion = 0;
            
            function loadQuestion() {
                const question = quizQuestions[currentQuestion];
                document.getElementById('quiz-question').innerHTML = `<h3>${question.question}</h3>`;
                
                const optionsContainer = document.getElementById('quiz-options');
                optionsContainer.innerHTML = '';
                
                question.options.forEach((option, index) => {
                    const button = document.createElement('button');
                    button.className = 'quiz-option';
                    button.textContent = option;
                    button.addEventListener('click', () => checkAnswer(index));
                    optionsContainer.appendChild(button);
                });
                
                quizFeedback.textContent = '';
                quizFeedback.className = 'quiz-feedback';
                nextQuestionBtn.style.display = 'none';
            }
            
            function checkAnswer(selectedIndex) {
                const question = quizQuestions[currentQuestion];
                const options = document.querySelectorAll('.quiz-option');
                
                options.forEach((option, index) => {
                    if (index === question.correct) {
                        option.classList.add('correct');
                    } else if (index === selectedIndex && index !== question.correct) {
                        option.classList.add('incorrect');
                    }
                    option.disabled = true;
                });
                
                if (selectedIndex === question.correct) {
                    quizFeedback.textContent = 'Correct! Well done!';
                    quizFeedback.className = 'quiz-feedback correct';
                } else {
                    quizFeedback.textContent = `Incorrect. The right answer is: ${question.options[question.correct]}`;
                    quizFeedback.className = 'quiz-feedback incorrect';
                }
                
                nextQuestionBtn.style.display = 'block';
            }
            
            nextQuestionBtn.addEventListener('click', () => {
                currentQuestion = (currentQuestion + 1) % quizQuestions.length;
                loadQuestion();
            });
            
            // Load first question
            loadQuestion();
        }
        
        // Load a default Pokémon when the section is active
        if (pokeSection.classList.contains('active')) {
            pokemonSearch.value = 'pikachu';
            performPokemonSearch();
        }
        
        // Load default Pokémon when tab is clicked
        if (pokeTab) {
            pokeTab.addEventListener('click', function() {
                if (pokemonContainer.innerHTML.includes('Search for a Pokémon to begin')) {
                    pokemonSearch.value = 'pikachu';
                    performPokemonSearch();
                }
            });
        }
    });

     // Wiki API functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Wiki tab functionality
        const wikiTab = document.querySelector('[data-section="wiki"]');
        const wikiSection = document.getElementById('wiki');
        
        // Wiki search elements
        const wikiSearch = document.getElementById('wiki-search');
        const wikiSearchBtn = document.getElementById('wiki-search-btn');
        const wikiSortFilter = document.getElementById('wiki-sort-filter');
        const wikiLanguageFilter = document.getElementById('wiki-language-filter');
        const wikiResultsFilter = document.getElementById('wiki-results-filter');
        const wikiLoadMoreBtn = document.getElementById('wiki-load-more');
        const wikiResults = document.getElementById('wiki-results');
        const wikiResultsCount = document.getElementById('wiki-results-count');
        const searchHistory = document.getElementById('wiki-search-history');
        const historyTags = document.getElementById('history-tags');
        
        let wikiOffset = 0;
        let currentWikiQuery = '';
        let currentWikiFilters = {
            sort: 'relevance',
            language: 'en',
            limit: '20'
        };
        
        // Load search history from localStorage
        let searchHistoryList = JSON.parse(localStorage.getItem('wikiSearchHistory')) || [];
        updateSearchHistory();
        
        // Search on button click
        wikiSearchBtn.addEventListener('click', () => {
            wikiOffset = 0;
            performWikiSearch();
        });
        
        // Search on Enter key
        wikiSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                wikiOffset = 0;
                performWikiSearch();
            }
        });
        
        // Filter change handlers
        wikiSortFilter.addEventListener('change', () => {
            wikiOffset = 0;
            currentWikiFilters.sort = wikiSortFilter.value;
            performWikiSearch();
        });
        
        wikiLanguageFilter.addEventListener('change', () => {
            wikiOffset = 0;
            currentWikiFilters.language = wikiLanguageFilter.value;
            performWikiSearch();
        });
        
        wikiResultsFilter.addEventListener('change', () => {
            wikiOffset = 0;
            currentWikiFilters.limit = wikiResultsFilter.value;
            performWikiSearch();
        });
        
        // Load more button
        wikiLoadMoreBtn.addEventListener('click', () => {
            wikiOffset += parseInt(currentWikiFilters.limit);
            performWikiSearch(true);
        });
        
        // Perform Wiki search
        function performWikiSearch(append = false) {
            currentWikiQuery = wikiSearch.value.trim();
            
            if (!currentWikiQuery) {
                wikiResults.innerHTML = '<div class="no-results">Please enter a search term</div>';
                wikiLoadMoreBtn.style.display = 'none';
                searchHistory.style.display = searchHistoryList.length > 0 ? 'block' : 'none';
                return;
            }
            
            // Add to search history
            addToSearchHistory(currentWikiQuery);
            
            if (!append) {
                wikiResults.innerHTML = `
                    <div class="wiki-loading">
                        <div class="wiki-loading-card"></div>
                        <div class="wiki-loading-card"></div>
                        <div class="wiki-loading-card"></div>
                    </div>
                `;
                wikiLoadMoreBtn.style.display = 'none';
            }
            
            // Build query parameters for MediaWiki API
            const params = new URLSearchParams({
                action: 'query',
                list: 'search',
                srsearch: currentWikiQuery,
                srlimit: currentWikiFilters.limit,
                sroffset: wikiOffset.toString(),
                srprop: 'snippet|timestamp',
                prop: 'info|pageimages',
                inprop: 'url',
                piprop: 'thumbnail',
                pithumbsize: '300',
                pilimit: 'max',
                format: 'json',
                origin: '*'
            });
            
            // Add sorting
            if (currentWikiFilters.sort === 'last_edited') {
                params.append('srsort', 'last_edit_desc');
            } else if (currentWikiFilters.sort === 'newest') {
                params.append('srsort', 'create_timestamp_desc');
            }
            
            const apiUrl = `https://${currentWikiFilters.language}.wikipedia.org/w/api.php?${params}`;
            
            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    let totalHits = 0;
                    if (data.query && data.query.searchinfo && typeof data.query.searchinfo.totalhits === 'number') {
                        totalHits = data.query.searchinfo.totalhits;
                    }
                    if (data.query && data.query.search) {
                        const searchResults = data.query.search;
                        // Get page IDs to fetch additional info
                        const pageIds = searchResults.map(result => result.pageid).join('|');
                        if (pageIds) {
                            // Fetch additional info including extracts
                            return fetch(`https://${currentWikiFilters.language}.wikipedia.org/w/api.php?action=query&pageids=${pageIds}&prop=extracts|info|pageimages&exintro=1&explaintext=1&inprop=url&piprop=thumbnail&pithumbsize=300&format=json&origin=*`)
                                .then(response => response.json())
                                .then(completeData => {
                                    return { searchResults, completeData, totalHits };
                                });
                        } else {
                            return { searchResults, completeData: { query: { pages: {} } }, totalHits };
                        }
                    } else {
                        throw new Error('No results found');
                    }
                })
                .then(data => {
                    const { searchResults, completeData, totalHits } = data;
                    renderWikiResults(searchResults, completeData, append, totalHits);
                    wikiResultsCount.textContent = totalHits;
                    // Show load more button if there might be more results
                    if (searchResults.length >= parseInt(currentWikiFilters.limit)) {
                        wikiLoadMoreBtn.style.display = 'block';
                    } else {
                        wikiLoadMoreBtn.style.display = 'none';
                    }
                    searchHistory.style.display = 'none';
                })
                .catch(error => {
                    console.error('Error fetching Wiki results:', error);
                    wikiResults.innerHTML = '<div class="no-results">Failed to search. Please try again later.</div>';
                    wikiLoadMoreBtn.style.display = 'none';
                    searchHistory.style.display = searchHistoryList.length > 0 ? 'block' : 'none';
                });
        }
        
        // Render Wiki results
    function renderWikiResults(searchResults, completeData, append = false, totalHits = null) {
            let html = '';
            
            searchResults.forEach(result => {
                const pageId = result.pageid;
                const pageInfo = completeData.query.pages[pageId];
                
                if (!pageInfo) return;
                
                const title = result.title;
                // Use snippet from search result as fallback, otherwise use extract
                const extract = pageInfo.extract || result.snippet || 'No summary available.';
                const pageUrl = pageInfo.fullurl || `https://${currentWikiFilters.language}.wikipedia.org/wiki/${encodeURIComponent(title)}`;
                const thumbnail = pageInfo.thumbnail ? pageInfo.thumbnail.source : null;
                const lastModified = pageInfo.touched ? new Date(pageInfo.touched).toLocaleDateString() : 'Unknown';
                
                // Highlight search terms in extract
                const highlightedExtract = highlightSearchTerms(extract, currentWikiQuery);
                
                html += `
                <div class="wiki-card">
                    <div class="wiki-image-container">
                        ${thumbnail ? 
                            `<img src="${thumbnail}" alt="${title}" class="wiki-image">` : 
                            `<div class="wiki-image-placeholder">W</div>`
                        }
                    </div>
                    <div class="wiki-content">
                        <h3 class="wiki-title">
                            <a href="${pageUrl}" target="_blank">${title}</a>
                        </h3>
                        <p class="wiki-extract">${highlightedExtract}</p>
                        <a href="${pageUrl}" target="_blank" class="wiki-read-more">Read more on Wikipedia</a>
                        <div class="wiki-meta">
                            <span>Last updated: ${lastModified}</span>
                            <span>Language: ${currentWikiFilters.language}</span>
                        </div>
                    </div>
                </div>
                `;
            });
            
            if (append) {
                wikiResults.innerHTML += html;
            } else {
                wikiResults.innerHTML = html;
            }
            // Update wiki results count (if not already set by performWikiSearch)
            if (totalHits !== null) {
                const wikiCount = document.getElementById('wiki-results-count');
                if (wikiCount) wikiCount.textContent = totalHits;
            }
        }
        
        // Highlight search terms in text
        function highlightSearchTerms(text, query) {
            if (!query || !text) return text || 'No summary available';
            
            // Clean text from HTML tags if any
            text = text.replace(/<[^>]*>/g, '');
            
            const terms = query.split(' ');
            let highlightedText = text;
            
            terms.forEach(term => {
                if (term.length > 2) {
                    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    highlightedText = highlightedText.replace(regex, '<span class="wiki-highlight">$1</span>');
                }
            });
            
            return highlightedText;
        }
        
        // Search history functionality
        function addToSearchHistory(query) {
            // Remove if already exists
            searchHistoryList = searchHistoryList.filter(item => item.toLowerCase() !== query.toLowerCase());
            
            // Add to beginning of array
            searchHistoryList.unshift(query);
            
            // Keep only last 10 searches
            if (searchHistoryList.length > 10) {
                searchHistoryList.pop();
            }
            
            // Save to localStorage
            localStorage.setItem('wikiSearchHistory', JSON.stringify(searchHistoryList));
            
            // Update UI
            updateSearchHistory();
        }
        
        function updateSearchHistory() {
            if (searchHistoryList.length > 0) {
                historyTags.innerHTML = '';
                
                searchHistoryList.forEach(query => {
                    const tag = document.createElement('div');
                    tag.className = 'history-tag';
                    tag.textContent = query;
                    tag.addEventListener('click', () => {
                        wikiSearch.value = query;
                        performWikiSearch();
                    });
                    
                    historyTags.appendChild(tag);
                });
                
                searchHistory.style.display = 'block';
            } else {
                searchHistory.style.display = 'none';
            }
        }
        
        // Show search history when section is active and no search has been made
        if (wikiSection.classList.contains('active') && !currentWikiQuery) {
            searchHistory.style.display = searchHistoryList.length > 0 ? 'block' : 'none';
        }
        
        // Load search history when tab is clicked
        if (wikiTab) {
            wikiTab.addEventListener('click', function() {
                if (wikiResults.innerHTML.includes('Search for something to begin')) {
                    searchHistory.style.display = searchHistoryList.length > 0 ? 'block' : 'none';
                }
            });
        }

    });

let originalTitle = document.title;
let blinkInterval;

document.addEventListener("visibilitychange", function () {
  if (document.hidden) {
    // Start blinking title
    blinkInterval = setInterval(() => {
      document.title =
        document.title === "Wait! Come back!"
          ? originalTitle
          : "Wait! Come back!";
    }, 1000); // change every 1 second
  } else {
    // Stop blinking and reset title
    clearInterval(blinkInterval);
    document.title = originalTitle;
  }
});

function detectDevice() {
      const ua = navigator.userAgent.toLowerCase();
      const warning = document.getElementById("device-warning");
      const box = document.getElementById("warning-box");
      const warningText = document.getElementById("warning-text");
      const warningImg = document.getElementById("warning-img");

      let device = "desktop";

      if (/android|iphone|ipod/i.test(ua)) {
        device = "mobile";
      } else if (/ipad|tablet/i.test(ua)) {
        device = "tablet";
      }

      if (device !== "desktop") {
        // Set text
        warningText.textContent =
          device === "mobile"
            ? "You’re on a mobile device. Please check ‘Desktop site’ or switch to a PC."
            : "You’re on a tablet. Please check ‘Desktop site’ or switch to a PC.";

        // Show background and popup
        warning.classList.add("show");
        setTimeout(() => box.classList.add("show"), 50); // slide + zoom

        // Staggered animation: show text then image
        setTimeout(() => warningText.classList.add("show"), 200);
        setTimeout(() => warningImg.classList.add("show"), 400);

        // Auto close after 5s
        setTimeout(() => closeWarning(), 5000);
      }
    }

    function closeWarning() {
      const warning = document.getElementById("device-warning");
      const box = document.getElementById("warning-box");
      const warningText = document.getElementById("warning-text");
      const warningImg = document.getElementById("warning-img");

      // Remove text and image animations
      warningText.classList.remove("show");
      warningImg.classList.remove("show");

      // Trigger slide-up + zoom-out
      box.classList.remove("show");
      box.classList.add("hide");

      // Fade out background
      setTimeout(() => {
        warning.classList.remove("show");
        box.classList.remove("hide");
      }, 400);
    }

    detectDevice();


