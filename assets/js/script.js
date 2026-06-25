/**
 * Kishan Kumar Singh | Portfolio Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        // Default to light if no preference is saved
        htmlElement.setAttribute('data-theme', 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- 1. Dynamic Year in Footer ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 2. Navigation Scroll Effect & Mobile Menu ---
    const nav = document.querySelector('.nav-glass');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // --- 3. Intersection Observer for Scroll Reveals ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const staggerGroups = document.querySelectorAll('.stagger-group');
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            entry.target.classList.add('visible');
            
            // If it's the achievements section, trigger counters
            if (entry.target.id === 'achievements') {
                runCounters(entry.target);
            }

            // Also check for stagger groups inside
            const innerStaggers = entry.target.querySelectorAll('.stagger-group');
            if (innerStaggers.length > 0) {
                innerStaggers.forEach((stagger, index) => {
                    setTimeout(() => {
                        stagger.classList.add('visible');
                        // Stagger children
                        const tags = stagger.querySelectorAll('.skill-tag');
                        tags.forEach((tag, tIdx) => {
                            tag.style.animationDelay = `${tIdx * 0.1}s`;
                        });
                    }, index * 200);
                });
            } else if (entry.target.classList.contains('stagger-group')) {
                entry.target.classList.add('visible');
                const tags = entry.target.querySelectorAll('.skill-tag');
                tags.forEach((tag, tIdx) => {
                    tag.style.animationDelay = `${tIdx * 0.1}s`;
                });
            }

            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));
    staggerGroups.forEach(el => revealObserver.observe(el));

    // Special observer just for hero stats (which might already be visible)
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const heroObserver = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                runCounters(heroStats);
                heroObserver.disconnect();
            }
        });
        heroObserver.observe(heroStats);
    }


    // --- 4. Counter Animation Logic ---
    function runCounters(container) {
        const counters = container.querySelectorAll('.counter');
        const speed = 200; // The lower the slower

        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;

                // Lower inc to slow and higher to speed up
                const inc = target / speed;

                if (count < target) {
                    // Check if it's a decimal number
                    if (target % 1 !== 0) {
                        counter.innerText = (count + inc).toFixed(1);
                    } else {
                        counter.innerText = Math.ceil(count + inc);
                    }
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target;
                }
            };
            
            // Start counter if not already done
            if(counter.innerText === "0") {
                updateCount();
            }
        });
    }

    // --- 5. GitHub Repos Fetch ---
    const reposContainer = document.getElementById('dynamic-repos');
    const githubUsername = 'KishanSinghsw20';
    // List of repos already pinned to exclude them from dynamic list
    const excludedRepos = ['AS_PHP', 'smart_bid_and_buy', 'SchoolManagement', 'Portfolio'];

    async function fetchGitHubRepos() {
        if (!reposContainer) return;
        
        try {
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=15`);
            if (!response.ok) throw new Error('GitHub API response not OK');
            
            const repos = await response.json();
            
            // Filter out excluded repos and limit to 6 for the grid
            const filteredRepos = repos.filter(repo => !excludedRepos.includes(repo.name) && !repo.fork).slice(0, 6);
            
            if (filteredRepos.length === 0) {
                reposContainer.innerHTML = `<p class="repo-desc">No additional public repositories found recently.</p>`;
                return;
            }

            let html = '';
            filteredRepos.forEach(repo => {
                const language = repo.language || 'Code';
                const langColor = getLanguageColor(language);
                const desc = repo.description || 'No description provided.';
                
                html += `
                <div class="repo-card tilt-effect">
                    <div class="repo-header">
                        <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                    </div>
                    <p class="repo-desc">${desc}</p>
                    <div class="repo-stats">
                        <span><span class="lang-color" style="background-color: ${langColor}"></span> ${language}</span>
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>🍴 ${repo.forks_count}</span>
                    </div>
                </div>
                `;
            });
            
            reposContainer.innerHTML = html;
            
            // Apply 3D tilt effect to newly fetched repos
            initTiltEffect();
            
        } catch (error) {
            console.error('Error fetching repos:', error);
            reposContainer.innerHTML = `<p class="repo-desc" style="color: var(--accent-violet)">>// Error fetching repositories. Check GitHub directly.</p>`;
        }
    }
    
    // Helper for language colors
    function getLanguageColor(lang) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#3178c6',
            'Python': '#3572A5',
            'PHP': '#4F5D95',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'C#': '#178600',
            'Vue': '#41b883',
            'Jupyter Notebook': '#DA5B0B'
        };
        return colors[lang] || '#8b949e';
    }

    fetchGitHubRepos();


    // --- 6. 3D Tilt Interaction Effect ---
    function initTiltEffect() {
        const tiltElements = document.querySelectorAll('.tilt-effect');
        
        tiltElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                // Get element dimensions
                const rect = el.getBoundingClientRect();
                
                // Calculate mouse position relative to element center
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Normalize position from -1 to 1
                const xNorm = (x / rect.width) * 2 - 1;
                const yNorm = (y / rect.height) * 2 - 1;
                
                // Calculate rotation (max 10 degrees)
                const rotateX = yNorm * -10;
                const rotateY = xNorm * 10;
                
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            el.addEventListener('mouseleave', () => {
                // Reset transform
                el.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            });
        });
    }

    // Initialize tilt effect on load
    initTiltEffect();
});
