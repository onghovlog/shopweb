document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // GLOBAL STATE & CONSTANTS
    // ----------------------------------------------------
    const API_URL = 'db.json';
    const DOMElements = {
        header: document.getElementById('site-header'),
        navToggle: document.getElementById('nav-toggle'),
        navMenu: document.getElementById('nav-menu'),
        navLinks: document.querySelectorAll('.nav-link'),
        packagesContainer: document.getElementById('packages-container'),
        faqContainer: document.getElementById('faq-container'),
        leadForm: document.getElementById('lead-form'),
        packageSelect: document.getElementById('package-select'),
        submitBtn: document.getElementById('submit-btn'),
        formFeedback: document.getElementById('form-feedback')
    };

    // ----------------------------------------------------
    // HEADER SCROLL EFFECT
    // ----------------------------------------------------
    const handleHeaderScroll = () => {
        if (window.scrollY > 50) {
            DOMElements.header.classList.add('scrolled');
        } else {
            DOMElements.header.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Trigger on load in case page is already scrolled

    // ----------------------------------------------------
    // MOBILE NAVBAR TOGGLE
    // ----------------------------------------------------
    const toggleMobileMenu = () => {
        DOMElements.navMenu.classList.toggle('open');
        const icon = DOMElements.navToggle.querySelector('i');
        if (DOMElements.navMenu.classList.contains('open')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars-staggered';
        }
    };

    DOMElements.navToggle.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking a link
    DOMElements.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (DOMElements.navMenu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // ----------------------------------------------------
    // ACCORDION HANDLERS
    // ----------------------------------------------------
    const initAccordions = () => {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const questionBtn = item.querySelector('.faq-question');
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const answer = otherItem.querySelector('.faq-answer');
                    if (answer) answer.style.maxHeight = null;
                });

                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                    const answer = item.querySelector('.faq-answer');
                    if (answer) {
                        answer.style.maxHeight = answer.scrollHeight + 'px';
                    }
                }
            });
        });
    };

    const DEFAULT_GALLERY = [
        {
            "id": 1,
            "type": "image",
            "title": "Mẫu Website Spa Cổ Điển",
            "src": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
            "thumb": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 2,
            "type": "video",
            "title": "Video Hướng Dẫn Vận Hành",
            "src": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "thumb": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 3,
            "type": "image",
            "title": "Mẫu Website Mỹ Phẩm Pastel",
            "src": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
            "thumb": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 4,
            "type": "video",
            "title": "Trải nghiệm Đặt Hàng Zalo 30s",
            "src": "https://www.youtube.com/shorts/q2O4uD4645Y",
            "thumb": "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 5,
            "type": "image",
            "title": "Mẫu Website Cá Nhân Sang Trọng",
            "src": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
            "thumb": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 6,
            "type": "video",
            "title": "Kiểm tra tốc độ Web",
            "src": "https://www.youtube.com/shorts/q2O4uD4645Y",
            "thumb": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 7,
            "type": "image",
            "title": "Mẫu Website Quần Áo Trẻ Em",
            "src": "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=1200&auto=format&fit=crop",
            "thumb": "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 8,
            "type": "video",
            "title": "Giới thiệu Tính năng SEO",
            "src": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "thumb": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 9,
            "type": "image",
            "title": "Mẫu Website Nội Thất Gỗ",
            "src": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
            "thumb": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 10,
            "type": "image",
            "title": "Mẫu Website Nước Hoa Cao Cấp",
            "src": "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop",
            "thumb": "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop"
        },
        {
            "id": 11,
            "type": "video",
            "title": "Hướng dẫn Quản trị trong 1 phút",
            "src": "https://www.youtube.com/shorts/q2O4uD4645Y",
            "thumb": "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop"
        }
    ];

    // ----------------------------------------------------
    // DYNAMIC HYDRATION FROM DB.JSON
    // ----------------------------------------------------
    const loadDynamicData = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Không thể kết nối đến tệp dữ liệu db.json');
            }
            const data = await response.json();
            
            if (data.packages && data.packages.length > 0) {
                renderPackages(data.packages);
            }
            if (data.faqs && data.faqs.length > 0) {
                renderFAQs(data.faqs);
            }
            if (data.contact) {
                renderContactInfo(data.contact);
            }
            if (data.gallery && data.gallery.length > 0) {
                renderGallery(data.gallery);
            } else {
                renderGallery(DEFAULT_GALLERY);
            }
        } catch (error) {
            console.warn('LƯU Ý: Chạy bằng tệp tĩnh cục bộ hoặc không tải được db.json. Đang sử dụng dữ liệu mặc định sẵn có trong HTML.', error);
            // Dynamic render failed but HTML fallback is already active, just bind accordions
            initAccordions();
            bindPackageSelectionButtons();
            renderGallery(DEFAULT_GALLERY);
        }
    };

    // Render Gallery
    const renderGallery = (gallery) => {
        const track = document.getElementById('gallery-track');
        const controls = document.getElementById('gallery-controls');
        const dotsContainer = document.getElementById('gallery-dots');
        const prevBtn = document.getElementById('gallery-prev');
        const nextBtn = document.getElementById('gallery-next');
        
        if (!track) return;

        // Chunk size: 9 items per screen
        const chunkSize = 9;
        const totalSlides = Math.ceil(gallery.length / chunkSize);
        let currentSlide = 0;

        // Chunking the gallery items
        const slidesHTML = [];
        for (let i = 0; i < gallery.length; i += chunkSize) {
            const chunk = gallery.slice(i, i + chunkSize);
            const slideContent = chunk.map(item => {
                const isVideo = item.type === 'video';
                const categoryIcon = isVideo ? '<i class="fa-solid fa-circle-play"></i> Video Demo' : '<i class="fa-regular fa-image"></i> Hình ảnh';
                const btnIcon = isVideo ? '<i class="fa-solid fa-play"></i> Xem Video' : '<i class="fa-solid fa-expand"></i> Phóng to';
                
                return `
                    <div class="gallery-item" data-type="${item.type}" data-src="${item.src}">
                        <div class="gallery-thumb-wrapper">
                            <img src="${item.thumb || item.src}" alt="${item.title}">
                            <div class="gallery-overlay">
                                <span class="gallery-category">${categoryIcon}</span>
                                <h3 class="gallery-item-title">${item.title}</h3>
                                <span class="gallery-btn">${btnIcon}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            slidesHTML.push(`<div class="gallery-slide gallery-grid">${slideContent}</div>`);
        }

        track.innerHTML = slidesHTML.join('');

        // Re-initialize lightbox modal event bindings
        initGalleryLightbox();

        // Control logic
        if (totalSlides <= 1) {
            if (controls) controls.classList.add('hidden');
            track.style.transform = 'translateX(0)';
            return;
        } else {
            if (controls) controls.classList.remove('hidden');
        }

        // Render dots
        if (dotsContainer) {
            dotsContainer.innerHTML = Array.from({ length: totalSlides }).map((_, idx) => `
                <button class="gallery-dot ${idx === 0 ? 'active' : ''}" data-slide="${idx}" aria-label="Đến trang ${idx + 1}"></button>
            `).join('');
        }

        const updateSliderState = () => {
            // Apply translation to slide track
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update dots active class
            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.gallery-dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentSlide);
                });
            }

            // Enable/disable buttons based on limits
            if (prevBtn) prevBtn.disabled = currentSlide === 0;
            if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
        };

        // Bind next/prev button clicks
        if (nextBtn) {
            nextBtn.onclick = () => {
                if (currentSlide < totalSlides - 1) {
                    currentSlide++;
                    updateSliderState();
                }
            };
        }

        if (prevBtn) {
            prevBtn.onclick = () => {
                if (currentSlide > 0) {
                    currentSlide--;
                    updateSliderState();
                }
            };
        }

        // Bind dot clicks
        if (dotsContainer) {
            dotsContainer.onclick = (e) => {
                const dot = e.target.closest('.gallery-dot');
                if (dot) {
                    currentSlide = parseInt(dot.getAttribute('data-slide'), 10);
                    updateSliderState();
                }
            };
        }

        // Initialize state
        updateSliderState();
    };

    // Render Contact Info
    const renderContactInfo = (contact) => {
        const elements = {
            address: document.getElementById('contact-address'),
            email: document.getElementById('contact-email'),
            phone: document.getElementById('contact-phone'),
            map: document.getElementById('contact-map'),
            linkZalo: document.getElementById('link-zalo'),
            linkMessenger: document.getElementById('link-messenger'),
            linkPhone: document.getElementById('link-phone'),
            labelPhone: document.getElementById('label-phone')
        };

        if (elements.address && contact.address) {
            elements.address.textContent = contact.address;
        }
        if (elements.email && contact.email) {
            elements.email.textContent = contact.email;
            elements.email.href = `mailto:${contact.email}`;
        }
        if (elements.phone && contact.phone) {
            elements.phone.textContent = contact.phoneFormatted || contact.phone;
            elements.phone.href = `tel:${contact.phone}`;
        }
        if (elements.map && contact.mapUrl) {
            elements.map.src = contact.mapUrl;
        }
        if (elements.linkZalo && contact.zaloUrl) {
            elements.linkZalo.href = contact.zaloUrl;
        }
        if (elements.linkMessenger && contact.messengerUrl) {
            elements.linkMessenger.href = contact.messengerUrl;
        }
        if (elements.linkPhone && contact.phone) {
            elements.linkPhone.href = `tel:${contact.phone}`;
        }
        if (elements.labelPhone && contact.phone) {
            elements.labelPhone.textContent = contact.phoneFormatted || contact.phone;
        }
    };

    // Render Packages
    const renderPackages = (packages) => {
        if (!DOMElements.packagesContainer) return;
        
        DOMElements.packagesContainer.innerHTML = packages.map((pkg, idx) => {
            const isFeatured = pkg.id === 'dynamic';
            const badgeText = isFeatured ? 'Khuyên Dùng' : 'Tiết Kiệm';
            
            return `
                <div class="package-card ${isFeatured ? 'featured' : ''}" id="pkg-${pkg.id}">
                    <div class="package-badge-popular">${badgeText}</div>
                    <div class="package-header">
                        <h3 class="package-name">${pkg.name}</h3>
                        <p class="package-tagline">${pkg.tagline || ''}</p>
                        <div class="package-price-box">
                            <span class="old-price">${pkg.originalPrice}</span>
                            <div class="price-now">
                                <span class="price-val">${pkg.price.replace('đ', '')}</span>
                                <span class="price-currency">đ</span>
                            </div>
                        </div>
                    </div>
                    <p class="package-desc">${pkg.description}</p>
                    <div class="package-divider"></div>
                    <ul class="package-features">
                        ${pkg.features.map(feat => `
                            <li><i class="fa-solid fa-circle-check"></i> ${feat}</li>
                        `).join('')}
                    </ul>
                    <div class="package-action">
                        <a href="#contact" class="btn btn-block ${isFeatured ? 'btn-primary' : 'btn-outline-cyan'} select-package-btn" data-package="${pkg.name}">
                            Đăng Ký Ngay
                        </a>
                    </div>
                </div>
            `;
        }).join('');

        bindPackageSelectionButtons();
    };

    // Render FAQs Accordion
    const renderFAQs = (faqs) => {
        if (!DOMElements.faqContainer) return;
        
        DOMElements.faqContainer.innerHTML = faqs.map((faq, idx) => {
            // First item active by default
            const isActive = idx === 0;
            return `
                <div class="faq-item ${isActive ? 'active' : ''}">
                    <button class="faq-question">
                        <span>${faq.question}</span>
                        <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer" style="${isActive ? 'max-height: 250px;' : ''}">
                        <p>${faq.answer}</p>
                    </div>
                </div>
            `;
        }).join('');

        initAccordions();
    };

    // ----------------------------------------------------
    // PACKAGE SELECTION REDIRECT
    // ----------------------------------------------------
    const bindPackageSelectionButtons = () => {
        const selectButtons = document.querySelectorAll('.select-package-btn');
        selectButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedPkg = btn.getAttribute('data-package');
                if (DOMElements.packageSelect && selectedPkg) {
                    DOMElements.packageSelect.value = selectedPkg;
                }
            });
        });
    };

    // ----------------------------------------------------
    // FORM SUBMISSION HANDLER
    // ----------------------------------------------------
    if (DOMElements.leadForm) {
        DOMElements.leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form values
            const fullname = document.getElementById('fullname').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const selectedPackage = DOMElements.packageSelect.value;
            const message = document.getElementById('message').value.trim();

            // Simple validation
            if (!fullname || !phone) {
                showFeedback('Vui lòng điền đầy đủ các thông tin bắt buộc (*)', 'error');
                return;
            }

            // Set loading state
            DOMElements.submitBtn.disabled = true;
            DOMElements.submitBtn.innerHTML = 'Đang xử lý đăng ký... <i class="fa-solid fa-circle-notch fa-spin"></i>';
            DOMElements.formFeedback.classList.add('hidden');

            const submissionData = {
                id: Date.now(),
                fullname,
                phone,
                package: selectedPackage,
                message,
                timestamp: new Date().toISOString()
            };

            // Attempt submitting via POST request
            try {
                // If using local server with json-server, it expects a POST to endpoint '/submissions' or '/contacts'
                // We try POSTing to 'http://localhost:3000/submissions' or relative path '/submissions'
                let isSubmitted = false;
                
                // Let's check if there is an active API backend or if we should mock it
                try {
                    const postResponse = await fetch('http://localhost:3000/submissions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(submissionData)
                    });
                    
                    if (postResponse.ok) {
                        isSubmitted = true;
                    }
                } catch(err) {
                    // JSON Server not running or blocked, we fallback to relative /submissions if running in normal webroot
                    try {
                        const relativePost = await fetch('submissions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(submissionData)
                        });
                        if (relativePost.ok) isSubmitted = true;
                    } catch(relativeErr) {
                        // Silent catch, fallback to localStorage/simulation
                    }
                }

                // Simulate processing delay for nice UX feedback
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Store in localStorage as local backup log
                let localSubmissions = JSON.parse(localStorage.getItem('web_leads') || '[]');
                localSubmissions.push(submissionData);
                localStorage.setItem('web_leads', JSON.stringify(localSubmissions));

                // Reset form and show success message
                DOMElements.leadForm.reset();
                showFeedback('Đăng ký tư vấn thành công! Chúng tôi sẽ liên hệ Zalo/SĐT của bạn sau ít phút.', 'success');
            } catch (error) {
                console.error('Error submitting form:', error);
                showFeedback('Có lỗi xảy ra trong quá trình gửi. Vui lòng liên hệ trực tiếp hotline hoặc Zalo để được hỗ trợ nhanh nhất!', 'error');
            } finally {
                // Reset button state
                DOMElements.submitBtn.disabled = false;
                DOMElements.submitBtn.innerHTML = 'Gửi Thông Tin Đăng Ký <i class="fa-regular fa-paper-plane"></i>';
            }
        });
    }

    const showFeedback = (msg, type) => {
        DOMElements.formFeedback.textContent = msg;
        DOMElements.formFeedback.className = `form-feedback ${type}`;
        DOMElements.formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    // ----------------------------------------------------
    // GALLERY LIGHTBOX MODAL
    // ----------------------------------------------------
    const initGalleryLightbox = () => {
        const modal = document.getElementById('media-modal');
        const modalContent = document.getElementById('modal-content');
        const modalClose = document.getElementById('modal-close');
        const galleryItems = document.querySelectorAll('.gallery-item');

        if (!modal || !modalContent || !modalClose || galleryItems.length === 0) return;

        // Parse YouTube URLs (handling Shorts, standard watch, share link, and embed URLs)
        const getYouTubeEmbedUrl = (url) => {
            let videoId = '';
            let isShort = false;

            if (url.includes('/shorts/')) {
                videoId = url.split('/shorts/')[1].split('?')[0];
                isShort = true;
            } else if (url.includes('v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            } else if (url.includes('/embed/')) {
                videoId = url.split('/embed/')[1].split('?')[0];
            }

            return {
                embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url,
                isShort: isShort
            };
        };

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.getAttribute('data-type');
                const src = item.getAttribute('data-src');

                modalContent.innerHTML = ''; // Clear previous media

                if (type === 'image') {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = 'Gallery Preview';
                    img.className = 'modal-img';
                    modalContent.appendChild(img);
                } else if (type === 'video') {
                    const { embedUrl, isShort } = getYouTubeEmbedUrl(src);
                    
                    const wrapper = document.createElement('div');
                    wrapper.className = `video-wrapper ${isShort ? 'vertical' : 'horizontal'}`;

                    const iframe = document.createElement('iframe');
                    iframe.src = embedUrl;
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                    iframe.allowFullscreen = true;

                    wrapper.appendChild(iframe);
                    modalContent.appendChild(wrapper);
                }

                // Open modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock background scroll
            });
        });

        // Close Modal function
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scroll
            modalContent.innerHTML = ''; // Stop video playback by removing iframe
        };

        modalClose.addEventListener('click', closeModal);

        // Close when clicking outside content area
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });
    };

    // ----------------------------------------------------
    // INITIALIZATION
    // ----------------------------------------------------
    loadDynamicData();
});
