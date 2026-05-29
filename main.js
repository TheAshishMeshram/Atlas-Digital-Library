document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentCategory = 'All';
    let searchQuery = '';
    let activeTab = 'active-shelf'; // 'active-shelf' or 'history'
    let isAdmin = localStorage.getItem('isAdmin') === 'true';
    let isStudentLoggedIn = localStorage.getItem('isStudentLoggedIn') === 'true';
    let studentName = localStorage.getItem('studentName') || '';
    let studentId = localStorage.getItem('studentId') || '';
    
    // DOM Elements
    const bookGrid = document.getElementById('book-grid');
    const categoryList = document.getElementById('category-list');
    const searchInput = document.getElementById('search-input');
    const statsTotal = document.getElementById('stats-total');
    const statsAvailable = document.getElementById('stats-available');
    const statsIssued = document.getElementById('stats-issued');
    const statsOverdue = document.getElementById('stats-overdue');
    
    // Drawer & Modals
    const shelfDrawer = document.getElementById('shelf-drawer');
    const openShelfBtn = document.getElementById('open-shelf-btn');
    const closeShelfBtn = document.getElementById('close-shelf-btn');
    const issueModal = document.getElementById('issue-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const issueForm = document.getElementById('issue-form');
    
    // Modal Details
    const modalBookId = document.getElementById('modal-book-id');
    const modalBookTitle = document.getElementById('modal-book-title');
    const modalBookAuthor = document.getElementById('modal-book-author');
    const modalBookCover = document.getElementById('modal-book-cover');
    const modalBookCategory = document.getElementById('modal-book-category');
    
    // Drawer tabs
    const tabActiveShelf = document.getElementById('tab-active-shelf');
    const tabHistory = document.getElementById('tab-history');
    const paneActiveShelf = document.getElementById('pane-active-shelf');
    const paneHistory = document.getElementById('pane-history');
    const activeShelfList = document.getElementById('active-shelf-list');
    const historyList = document.getElementById('history-list');
    
    // Theme
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');

    // Admin Controls
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const closeAdminModalBtn = document.getElementById('close-admin-modal-btn');
    const cancelAdminModalBtn = document.getElementById('cancel-admin-modal-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminUsernameInput = document.getElementById('admin-username');
    const adminPasswordInput = document.getElementById('admin-password');
    
    const addBookBtn = document.getElementById('add-book-btn');
    const addBookModal = document.getElementById('add-book-modal');
    const closeAddBookBtn = document.getElementById('close-add-book-btn');
    const cancelAddBookBtn = document.getElementById('cancel-add-book-btn');
    const addBookForm = document.getElementById('add-book-form');

    // Top Horizontal Navigation & Views
    const navTabs = document.querySelectorAll('.nav-tab[data-target]');
    const viewContents = document.querySelectorAll('.view-content');
    const goldLoadingBar = document.getElementById('gold-loading-bar');
    
    // Student Login DOM Elements
    const studentLoginTab = document.getElementById('student-login-tab');
    const studentLoginText = document.getElementById('student-login-text');
    const studentLoginModal = document.getElementById('student-login-modal');
    const closeStudentModalBtn = document.getElementById('close-student-modal-btn');
    const cancelStudentModalBtn = document.getElementById('cancel-student-modal-btn');
    const studentLoginForm = document.getElementById('student-login-form');
    const studentUsernameInput = document.getElementById('student-username-input');
    const studentIdInput = document.getElementById('student-id-input');

    // Admin Dashboard Specific DOM Elements
    const adminDashboardView = document.getElementById('admin-dashboard-view');
    const leftTabs = document.querySelector('.left-tabs');
    const circleBarApps = document.getElementById('circle-bar-apps');
    const circleValApps = document.getElementById('circle-val-apps');
    const circleBarIssued = document.getElementById('circle-bar-issued');
    const circleValIssued = document.getElementById('circle-val-issued');
    const circleBarRemain = document.getElementById('circle-bar-remain');
    const circleValRemain = document.getElementById('circle-val-remain');
    const adminCardRequestsList = document.getElementById('admin-card-requests-list');
    const adminBooksList = document.getElementById('admin-books-list');
    const adminAddBookTrigger = document.getElementById('admin-add-book-trigger');
    
    // Languages Dropdown
    const languageTab = document.getElementById('language-tab');
    const langDropdownMenu = document.getElementById('lang-dropdown-menu');
    const langOptions = document.querySelectorAll('.lang-option');
    const currentLangText = document.getElementById('current-lang-text');
    
    // Carousel Track
    const carouselTrack = document.getElementById('carousel-track');
    
    // Digital Card Container & Modals
    const sidebarCardContainer = document.getElementById('sidebar-card-container');
    const cardApplyModal = document.getElementById('card-apply-modal');
    const closeCardApplyBtn = document.getElementById('close-card-apply-btn');
    const cancelCardApplyBtn = document.getElementById('cancel-card-apply-btn');
    const cardApplyForm = document.getElementById('card-apply-form');
    
    // Admin Card Pane
    const tabCardApplications = document.getElementById('tab-card-applications');
    const paneCardApplications = document.getElementById('pane-card-applications');
    const cardApplicationsList = document.getElementById('card-applications-list');
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);

    // Initialize Admin UI
    updateAdminUI();

    // Initial Fetch
    fetchCategories();
    fetchStats();
    fetchBooks();
    fetchHistory();

    // Trigger glowing progress bar load on initial page load / refresh
    if (goldLoadingBar) {
        goldLoadingBar.style.opacity = '1';
        goldLoadingBar.style.width = '30%';
        
        setTimeout(() => {
            goldLoadingBar.style.width = '65%';
        }, 150);
        
        setTimeout(() => {
            goldLoadingBar.style.width = '100%';
            
            setTimeout(() => {
                goldLoadingBar.style.opacity = '0';
                setTimeout(() => {
                    goldLoadingBar.style.width = '0%';
                }, 300);
            }, 200);
        }, 400);
    }

    // Event Listeners
    // Search with Debounce
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        searchQuery = e.target.value;
        debounceTimer = setTimeout(() => {
            fetchBooks();
        }, 300);
    });

    // Toggle Shelf Drawer
    openShelfBtn.addEventListener('click', () => {
        shelfDrawer.classList.add('open');
        fetchHistory(); // Refresh history when opening shelf
    });
    
    closeShelfBtn.addEventListener('click', () => {
        shelfDrawer.classList.remove('open');
    });

    // Close Modal
    const closeModal = () => {
        issueModal.classList.remove('active');
        issueForm.reset();
    };
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    
    // Form Submission
    issueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const bookId = modalBookId.value;
        const studentName = document.getElementById('student-name').value.strip ? 
                            document.getElementById('student-name').value.trim() : 
                            document.getElementById('student-name').value;
        const studentId = document.getElementById('student-id').value.strip ? 
                          document.getElementById('student-id').value.trim() : 
                          document.getElementById('student-id').value;
        const durationDays = document.getElementById('duration-days').value;
        
        if (!studentName || !studentId) {
            showToast('Please fill out all fields.', 'error');
            return;
        }

        const payload = {
            book_id: parseInt(bookId),
            student_name: studentName,
            student_id: studentId,
            duration_days: parseInt(durationDays)
        };

        fetch('/api/issue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast(data.message, 'success');
                closeModal();
                // Refresh states
                fetchBooks();
                fetchStats();
                fetchHistory();
                fetchCategories(); // counts might change
            }
        })
        .catch(err => {
            console.error('Error issuing book:', err);
            showToast('Failed to connect to the server.', 'error');
        });
    });

    // Drawer Tabs switching
    tabActiveShelf.addEventListener('click', () => {
        activeTab = 'active-shelf';
        tabActiveShelf.classList.add('active');
        tabHistory.classList.remove('active');
        paneActiveShelf.classList.add('active');
        paneHistory.classList.remove('active');
    });

    tabHistory.addEventListener('click', () => {
        activeTab = 'history';
        tabHistory.classList.add('active');
        tabActiveShelf.classList.remove('active');
        paneHistory.classList.add('active');
        paneActiveShelf.classList.remove('active');
    });

    // Theme Toggle click handler
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeUI(newTheme);
    });

    function updateThemeUI(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Dark Mode';
        }
    }

    // Update Admin UI elements
    function updateAdminUI() {
        const adminText = document.getElementById('admin-text');
        const adminIcon = document.getElementById('admin-icon');
        
        if (isAdmin) {
            adminLoginBtn.classList.add('logged-in');
            adminText.textContent = 'Admin Logout';
            adminIcon.className = 'fas fa-sign-out-alt';
            if (addBookBtn) addBookBtn.style.display = 'flex';
            if (tabCardApplications) tabCardApplications.style.display = 'flex';
            
            // Hide standard student tab navigations and other tabs
            if (leftTabs) leftTabs.style.display = 'none';
            if (studentLoginTab) studentLoginTab.style.display = 'none';
            
            // Hide home, about, policy views and activate admin view
            viewContents.forEach(view => {
                if (view.id === 'admin-dashboard-view') {
                    view.classList.add('active');
                    view.style.display = 'block';
                } else {
                    view.classList.remove('active');
                    view.style.display = 'none';
                }
            });
            
            // Render premium holographic admin gear pass in sidebar!
            if (sidebarCardContainer) {
                sidebarCardContainer.innerHTML = `
                    <div class="admin-badge-widget">
                        <div class="admin-badge-gear-wrapper">
                            <i class="fas fa-cog"></i>
                        </div>
                        <h3>System Admin</h3>
                        <p>HOLOGRAPHIC PASS</p>
                    </div>
                `;
            }
            
            // Render Admin Dashboard stats and controls
            renderAdminDashboard();
            
        } else {
            adminLoginBtn.classList.remove('logged-in');
            adminText.textContent = 'Admin Login';
            adminIcon.className = 'fas fa-user-shield';
            if (addBookBtn) addBookBtn.style.display = 'none';
            if (tabCardApplications) tabCardApplications.style.display = 'none';
            
            // Restore student navigations
            if (leftTabs) leftTabs.style.display = 'flex';
            if (studentLoginTab) studentLoginTab.style.display = 'flex';
            
            // Set home view active and reset nav tab selection
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            const homeTab = document.getElementById('tab-home');
            if (homeTab) homeTab.classList.add('active');
            
            viewContents.forEach(view => {
                if (view.id === 'home-view') {
                    view.classList.add('active');
                    view.style.display = 'block';
                } else {
                    view.classList.remove('active');
                    view.style.display = 'none';
                }
            });
            
            // Restore normal student card widget in sidebar
            updateStudentCardWidget();
        }
    }

    // Toggle Admin Login Modal / Perform Logout
    adminLoginBtn.addEventListener('click', () => {
        if (isAdmin) {
            isAdmin = false;
            localStorage.setItem('isAdmin', 'false');
            updateAdminUI();
            fetchBooks(); // Refresh to hide delete buttons
            showToast('Logged out of admin portal.', 'success');
        } else {
            adminLoginModal.classList.add('active');
            adminUsernameInput.focus();
        }
    });

    const closeAdminModal = () => {
        adminLoginModal.classList.remove('active');
        adminLoginForm.reset();
    };

    closeAdminModalBtn.addEventListener('click', closeAdminModal);
    cancelAdminModalBtn.addEventListener('click', closeAdminModal);

    // Admin Login form submit
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = adminUsernameInput.value.trim();
        const password = adminPasswordInput.value;

        fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                isAdmin = true;
                localStorage.setItem('isAdmin', 'true');
                updateAdminUI();
                closeAdminModal();
                fetchBooks(); // Refresh to show delete buttons
                showToast('Welcome, Administrator.', 'success');
            }
        })
        .catch(err => {
            console.error('Error logging in:', err);
            showToast('Failed to connect to the server.', 'error');
        });
    });

    // Add Book Modal logic
    if (addBookBtn) {
        addBookBtn.addEventListener('click', () => {
            addBookModal.classList.add('active');
        });
    }

    const closeAddBookModal = () => {
        addBookModal.classList.remove('active');
        addBookForm.reset();
    };

    if (closeAddBookBtn) closeAddBookBtn.addEventListener('click', closeAddBookModal);
    if (cancelAddBookBtn) cancelAddBookBtn.addEventListener('click', closeAddBookModal);

    // Add Book form submit
    addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('book-title-input').value.trim();
        const author = document.getElementById('book-author-input').value.trim();
        const category = document.getElementById('book-category-input').value;
        const description = document.getElementById('book-description-input').value.trim();
        const coverUrl = document.getElementById('book-cover-input').value.trim();
        const totalCopies = parseInt(document.getElementById('book-copies-input').value) || 1;

        if (!title || !author || !category || !description) {
            showToast('Please fill out all fields.', 'error');
            return;
        }

        fetch('/api/admin/add-book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                author,
                category,
                description,
                cover_url: coverUrl,
                total_copies: totalCopies
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast(data.message, 'success');
                closeAddBookModal();
                fetchBooks();
                fetchStats();
                fetchCategories();
            }
        })
        .catch(err => {
            console.error('Error adding book:', err);
            showToast('Failed to connect to the server.', 'error');
        });
    });

    // ==========================================
    // PREMIUM NAV, CAROUSEL, AND TRANSLATIONS LOGIC
    // ==========================================

    // Dynamic Navigation Tab switching with Golden Loading Bar transition
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetViewId = tab.getAttribute('data-target');
            const currentActiveTab = document.querySelector('.nav-tab.active');
            
            if (tab === currentActiveTab) return; // Already on this tab
            
            // Trigger Golden Loading Bar
            goldLoadingBar.style.opacity = '1';
            goldLoadingBar.style.width = '30%';
            
            setTimeout(() => {
                goldLoadingBar.style.width = '70%';
            }, 150);
            
            setTimeout(() => {
                goldLoadingBar.style.width = '100%';
                
                // Swap active tab styles
                if (currentActiveTab) currentActiveTab.classList.remove('active');
                tab.classList.add('active');
                
                // Toggle view container visibilities
                viewContents.forEach(view => {
                    if (view.id === targetViewId) {
                        view.classList.add('active');
                        view.style.display = 'block';
                    } else {
                        view.classList.remove('active');
                        view.style.display = 'none';
                    }
                });
                
                // Refresh book tracks or categories if loading home view
                if (targetViewId === 'home-view') {
                    fetchBooks();
                    fetchCategories();
                    fetchStats();
                }
                
                // Fade out loading bar
                setTimeout(() => {
                    goldLoadingBar.style.opacity = '0';
                    setTimeout(() => {
                        goldLoadingBar.style.width = '0%';
                    }, 300);
                }, 200);
                
            }, 400); // 400ms loading duration for a high-end transition feel
        });
    });

    // Languages Dropdown Menu toggler
    if (languageTab) {
        languageTab.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdownMenu.classList.toggle('active');
        });
    }

    // Close dropdown on click outside
    document.addEventListener('click', () => {
        if (langDropdownMenu) langDropdownMenu.classList.remove('active');
    });

    // Language selector options click handler
    langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedLang = option.getAttribute('data-lang');
            const activeOption = document.querySelector('.lang-option.active');
            
            if (option === activeOption) return;
            
            if (activeOption) activeOption.classList.remove('active');
            option.classList.add('active');
            
            // Update storage and text
            localStorage.setItem('appLanguage', selectedLang);
            currentLangText.textContent = option.textContent.split(' ')[0];
            
            // Fire golden loading bar transition for full interface reload
            goldLoadingBar.style.opacity = '1';
            goldLoadingBar.style.width = '40%';
            setTimeout(() => { goldLoadingBar.style.width = '85%'; }, 150);
            
            setTimeout(() => {
                goldLoadingBar.style.width = '100%';
                
                // Apply UI Translations
                applyTranslations(selectedLang);
                
                showToast(
                    selectedLang === 'es' ? '¡Idioma cambiado a Español!' :
                    selectedLang === 'fr' ? 'Langue changée en Français !' :
                    selectedLang === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है!' :
                    'Interface language switched to English!',
                    'success'
                );
                
                setTimeout(() => {
                    goldLoadingBar.style.opacity = '0';
                    setTimeout(() => { goldLoadingBar.style.width = '0%'; }, 300);
                }, 200);
            }, 350);
        });
    });

    // Multilingual live localization mapping
    const translations = {
        en: {
            brand: "Atlas Library",
            subtitle: "Curated collections of literature, science, and design for academic excellence.",
            home: "Home",
            about: "About",
            policy: "Policy",
            featured: "Featured Masterpieces",
            statsTotal: "Total Copies",
            statsAvailable: "Available",
            statsIssued: "Issued",
            statsOverdue: "Overdue",
            catalogs: "Catalogs",
            addBook: "Add Book",
            myShelf: "My Shelf / History",
            themeDark: "Dark Mode",
            themeLight: "Light Mode",
            searchPlaceholder: "Search by title, author, or description...",
            adminLogin: "Admin Login",
            adminLogout: "Admin Logout",
            // About Page
            aboutTitle: "About Atlas Library",
            aboutSubtitle: "A sanctuary of knowledge, science, and human ingenuity.",
            aboutP1: "Welcome to the Atlas Library Portal. Established as a curated space for researchers, students, and craftsmen, our repository hosts key seminal works spanning physics, mathematical principles, cognitively excellent designs, and classical literature.",
            aboutP2: "We believe that a library is more than a storage of files; it is a dynamic catalyst for intellectual growth. Through our digital gateway, we present a fluid, beautifully balanced interface that makes acquiring and returning volumes effortless.",
            aboutCard1Title: "Curated Excellence",
            aboutCard1Desc: "Seminal publications span high-impact domains like Agile Software Engineering, Industrial Design, Corporate Strategy, and Philosophy.",
            aboutCard2Title: "Dynamic Operations",
            aboutCard2Desc: "Real-time status tracking, instant borrowing workflows, personal activity logs, and secure student digital cards.",
            aboutCard3Title: "Stunning Aesthetics",
            aboutCard3Desc: "Crafted under visual balance frameworks utilizing harmonized charcoal shades, warm light-wood modes, and glowing gold accents.",
            aboutQuote: "\"Books are a uniquely portable magic.\"",
            // Policy Page
            policyTitle: "Library Policies",
            policySubtitle: "Stewardship guidelines for a balanced academic community.",
            policyCard1Title: "Borrowing Limit",
            policyCard1Desc: "Students can borrow up to three (3) books at any given time. Active issues are tracked under the personal shelf drawer.",
            policyCard2Title: "Loan Duration",
            policyCard2Desc: "Standard student checkout duration is seven (7) calendar days. Extended renewals are subject to reservation queues.",
            policyCard3Title: "Renewal Requests",
            policyCard3Desc: "Books can be renewed once if no active reservation exists from other scholars. Request renewal prior to due date.",
            policyCard4Title: "Overdue Penalties",
            policyCard4Desc: "Failure to return materials results in temporary borrowing suspensions. Alerts are sent directly to student email accounts."
        },
        es: {
            brand: "Biblioteca Atlas",
            subtitle: "Colecciones curadas de literatura, ciencia y diseño para la excelencia académica.",
            home: "Inicio",
            about: "Nosotros",
            policy: "Políticas",
            featured: "Obras Maestras Destacadas",
            statsTotal: "Copias Totales",
            statsAvailable: "Disponibles",
            statsIssued: "Prestados",
            statsOverdue: "Atrasados",
            catalogs: "Catálogos",
            addBook: "Añadir Libro",
            myShelf: "Mi Estante / Historial",
            themeDark: "Modo Oscuro",
            themeLight: "Modo Claro",
            searchPlaceholder: "Buscar por título, autor o descripción...",
            adminLogin: "Iniciar Sesión",
            adminLogout: "Cerrar Sesión",
            // About Page
            aboutTitle: "Sobre la Biblioteca Atlas",
            aboutSubtitle: "Un santuario de conocimiento, ciencia e ingenio humano.",
            aboutP1: "Bienvenido al Portal de la Biblioteca Atlas. Establecido como un espacio curado para investigadores, estudiantes y artesanos, nuestro repositorio alberga obras seminales clave que abarcan física, principios matemáticos, diseños de excelencia cognitiva y literatura clásica.",
            aboutP2: "Creemos que una biblioteca es más que un almacenamiento de archivos; es un catalizador dinámico para el crecimiento intelectual. A través de nuestra puerta digital, presentamos una interfaz fluida y bellamente equilibrada que facilita la adquisición y devolución de volúmenes.",
            aboutCard1Title: "Excelencia Curada",
            aboutCard1Desc: "Las publicaciones fundamentales abarcan dominios de alto impacto como la ingeniería de software ágil, el diseño industrial, la estrategia corporativa y la filosofía.",
            aboutCard2Title: "Operaciones Dinámicas",
            aboutCard2Desc: "Seguimiento de estado en tiempo real, flujos de trabajo de préstamo instantáneo, registros de actividad personal y tarjetas digitales seguras para estudiantes.",
            aboutCard3Title: "Estética Impresionante",
            aboutCard3Desc: "Diseñado bajo marcos de equilibrio visual utilizando tonos de carbón armonizados, modos de madera clara cálida y acentos dorados brillantes.",
            aboutQuote: "\"Los libros son una magia exclusivamente portátil.\"",
            // Policy Page
            policyTitle: "Políticas de la Biblioteca",
            policySubtitle: "Pautas de administración para una comunidad académica equilibrada.",
            policyCard1Title: "Límite de Préstamo",
            policyCard1Desc: "Los estudiantes pueden tomar prestados hasta tres (3) libros en cualquier momento. Los préstamos activos se registran en el estante personal.",
            policyCard2Title: "Duración del Préstamo",
            policyCard2Desc: "La duración estándar del préstamo para estudiantes es de siete (7) días naturales. Las renovaciones extendidas están sujetas a colas de reserva.",
            policyCard3Title: "Solicitudes de Renovación",
            policyCard3Desc: "Los libros se pueden renovar una vez si no existe una reserva activa de otros académicos. Solicite la renovación antes de la fecha de vencimiento.",
            policyCard4Title: "Sanciones por Atraso",
            policyCard4Desc: "El hecho de no devolver los materiales resulta en suspensiones temporales de préstamo. Las alertas se envían a los correos de los estudiantes."
        },
        fr: {
            brand: "Bibliothèque Atlas",
            subtitle: "Collections soignées de littérature, de science et de design pour l'excellence académique.",
            home: "Accueil",
            about: "À Propos",
            policy: "Politiques",
            featured: "Chefs-d'œuvre Vedettes",
            statsTotal: "Total d'exemplaires",
            statsAvailable: "Disponible",
            statsIssued: "Emprunté",
            statsOverdue: "En Retard",
            catalogs: "Catalogues",
            addBook: "Ajouter un Livre",
            myShelf: "Mon Étagère / Historique",
            themeDark: "Mode Sombre",
            themeLight: "Mode Clair",
            searchPlaceholder: "Rechercher par titre, auteur ou description...",
            adminLogin: "Connexion Admin",
            adminLogout: "Déconnexion Admin",
            // About Page
            aboutTitle: "À propos de la Bibliothèque Atlas",
            aboutSubtitle: "Un sanctuaire de connaissances, de sciences et d'ingéniosité humaine.",
            aboutP1: "Bienvenue sur le portail de la bibliothèque Atlas. Établi comme un espace réservé aux chercheurs, étudiants et artisans, notre référentiel héberge des œuvres séminales majeures couvrant la physique, les principes mathématiques, les conceptions cognitivement excellentes et la littérature classique.",
            aboutP2: "Nous pensons qu'une bibliothèque est plus qu'un simple stockage de fichiers ; c'est un catalyseur dynamique pour la croissance intellectuelle. Grâce à notre passerelle numérique, nous présentons une interface fluide et magnifiquement équilibrée qui facilite l'acquisition et le retour des volumes.",
            aboutCard1Title: "Excellence Soignée",
            aboutCard1Desc: "Les publications fondamentales couvrent des domaines à fort impact tels que le génie logiciel agile, le design industriel, la stratégie d'entreprise et la philosophie.",
            aboutCard2Title: "Opérations Dynamiques",
            aboutCard2Desc: "Suivi du statut en temps réel, flux de travail d'emprunt instantané, journaux d'activité personnelle et cartes numériques sécurisées pour les étudiants.",
            aboutCard3Title: "Esthétique Superbe",
            aboutCard3Desc: "Conçu selon des cadres d'équilibre visuel utilisant des teintes de charbon harmonisées, des modes de bois clair chaleureux et des accents dorés brillants.",
            aboutQuote: "\"Les livres sont une magie unique et portable.\"",
            // Policy Page
            policyTitle: "Règlement de la Bibliothèque",
            policySubtitle: "Directives de gestion pour une communauté académique équilibrée.",
            policyCard1Title: "Limite d'Emprunt",
            policyCard1Desc: "Les étudiants peuvent emprunter jusqu'à trois (3) livres à tout moment. Les emprunts actifs sont suivis dans l'étagère personnelle.",
            policyCard2Title: "Durée du Prêt",
            policyCard2Desc: "La durée standard du prêt étudiant est de sept (7) jours calendaires. Les renouvellements prolongés sont soumis aux files d'attente.",
            policyCard3Title: "Demandes de Renouvellement",
            policyCard3Desc: "Les livres peuvent être renouvelés une fois si aucun autre chercheur n'a réservé l'ouvrage. Demandez le renouvellement avant la date d'échéance.",
            policyCard4Title: "Pénalités de Retard",
            policyCard4Desc: "Le non-retour des documents entraîne des suspensions temporaires d'emprunt. Les alertes sont envoyées directement aux emails des étudiants."
        },
        hi: {
            brand: "एटलस पुस्तकालय",
            subtitle: "शैक्षणिक उत्कृष्टता के लिए साहित्य, विज्ञान और डिजाइन का विशेष संग्रह।",
            home: "मुख्य पृष्ठ",
            about: "परिचय",
            policy: "नियम एवं शर्तें",
            featured: "विशेष उत्कृष्ट कृतियाँ",
            statsTotal: "कुल प्रतियां",
            statsAvailable: "उपलब्ध",
            statsIssued: "जारी किए गए",
            statsOverdue: "विलंबित",
            catalogs: "पुस्तकों की सूची",
            addBook: "पुस्तक जोड़ें",
            myShelf: "मेरी शेल्फ / इतिहास",
            themeDark: "डार्क मोड",
            themeLight: "लाइट मोड",
            searchPlaceholder: "शीर्षक, लेखक या विवरण द्वारा खोजें...",
            adminLogin: "एडमिन लॉगिन",
            adminLogout: "एडमिन लॉगआऊट",
            // About Page
            aboutTitle: "एटलस पुस्तकालय के बारे में",
            aboutSubtitle: "ज्ञान, विज्ञान और मानवीय सरलता का एक पावन मंदिर।",
            aboutP1: "एटलस पुस्तकालय पोर्टल में आपका स्वागत है। शोधकर्ताओं, छात्रों और कारीगरों के लिए एक विशेष स्थान के रूप में स्थापित, हमारा संग्रह भौतिकी, गणितीय सिद्धांतों, उत्कृष्ट डिजाइनों और शास्त्रीय साहित्य से जुड़े महत्वपूर्ण कार्यों को संजोता है।",
            aboutP2: "हमारा मानना ​​है कि एक पुस्तकालय केवल फाइलों का संग्रह नहीं है; यह बौद्धिक विकास के लिए एक गतिशील उत्प्रेरक है। अपने डिजिटल प्रवेश द्वार के माध्यम से, हम एक सहज, सुंदर और संतुलित इंटरफ़ेस प्रस्तुत करते हैं जो पुस्तकों को प्राप्त करने और वापस करने को आसान बनाता है।",
            aboutCard1Title: "विशिष्ट उत्कृष्टता",
            aboutCard1Desc: "महत्वपूर्ण प्रकाशनों में एजाइल सॉफ्टवेयर इंजीनियरिंग, इंडस्ट्रियल डिजाइन, कॉर्पोरेट रणनीति और दर्शनशास्त्र जैसे उच्च प्रभाव वाले क्षेत्र शामिल हैं।",
            aboutCard2Title: "सक्रिय संचालन",
            aboutCard2Desc: "वास्तविक समय स्थिति ट्रैकिंग, तत्काल उधार वर्कफ़्लो, व्यक्तिगत गतिविधि लॉग, और सुरक्षित छात्र डिजिटल लाइब्रेरी कार्ड।",
            aboutCard3Title: "आकर्षक सौंदर्यशास्त्र",
            aboutCard3Desc: "सामंजस्यपूर्ण चारकोल शेड्स, गर्म हल्की लकड़ी के मोड और चमकदार सुनहरे रंगों का उपयोग करके दृश्य संतुलन के ढांचे के तहत तैयार किया गया है।",
            aboutQuote: "\"किताबें एक अनोखा और आसानी से ले जाने योग्य जादू हैं।\"",
            // Policy Page
            policyTitle: "पुस्तकालय की नीतियां",
            policySubtitle: "एक संतुलित शैक्षणिक समुदाय के लिए प्रबंधन दिशानिर्देश।",
            policyCard1Title: "उधार लेने की सीमा",
            policyCard1Desc: "छात्र किसी भी समय अधिकतम तीन (3) पुस्तकें उधार ले सकते हैं। सक्रिय ऋणों को व्यक्तिगत शेल्फ दराज के तहत ट्रैक किया जाता है।",
            policyCard2Title: "ऋण की अवधि",
            policyCard2Desc: "मानक छात्र चेकआउट अवधि सात (7) कैलेंडर दिन है। विस्तारित नवीनीकरण आरक्षण कतारों के अधीन हैं।",
            policyCard3Title: "नवीनीकरण का अनुरोध",
            policyCard3Desc: "यदि अन्य विद्वानों द्वारा कोई सक्रिय आरक्षण मौजूद नहीं है तो पुस्तकों को एक बार नवीनीकृत किया जा सकता है। नियत तारीख से पहले नवीनीकरण का अनुरोध करें।",
            policyCard4Title: "विलंब शुल्क व दंड",
            policyCard4Desc: "सामग्री वापस न करने पर अस्थायी रूप से उधार लेने पर रोक लगा दी जाती है। चेतावनी सीधे छात्र के पंजीकृत ईमेल पर भेजी जाती है।"
        }
    };

    // Live Localization Apply Translation function
    function applyTranslations(lang) {
        const t = translations[lang] || translations.en;
        
        // Brand details
        document.getElementById('brand-title').textContent = t.brand;
        document.getElementById('brand-subtitle').textContent = t.subtitle;
        
        // Navigation tabs
        document.getElementById('tab-home').querySelector('span').textContent = t.home;
        document.getElementById('tab-about').querySelector('span').textContent = t.about;
        document.getElementById('tab-policy').querySelector('span').textContent = t.policy;
        
        // Search bar
        document.getElementById('search-input').placeholder = t.searchPlaceholder;
        
        // Statistics grid headings
        document.getElementById('stats-total-lbl').textContent = t.statsTotal;
        document.getElementById('stats-avail-lbl').textContent = t.statsAvailable;
        document.getElementById('stats-issued-lbl').textContent = t.statsIssued;
        document.getElementById('stats-overdue-lbl').textContent = t.statsOverdue;
        
        // Featured Showcase
        document.getElementById('featured-title-lbl').innerHTML = `<i class="fas fa-star" style="color: var(--gold-primary);"></i> ${t.featured}`;
        
        // Catalog elements
        document.getElementById('catalogs-title-lbl').textContent = t.catalogs;
        document.getElementById('add-book-lbl').textContent = t.addBook;
        document.getElementById('myshelf-lbl').textContent = t.myShelf;
        
        // Sidebar footer indicators
        if (isAdmin) {
            document.getElementById('admin-text').textContent = t.adminLogout;
        } else {
            document.getElementById('admin-text').textContent = t.adminLogin;
        }
        
        document.getElementById('theme-text').textContent = 
            document.documentElement.getAttribute('data-theme') === 'dark' ? t.themeLight : t.themeDark;
            
        // About Page translations
        document.getElementById('about-title-lbl').textContent = t.aboutTitle;
        document.getElementById('about-subtitle-lbl').textContent = t.aboutSubtitle;
        document.getElementById('about-p1-lbl').textContent = t.aboutP1;
        document.getElementById('about-p2-lbl').textContent = t.aboutP2;
        
        document.getElementById('about-card1-title').textContent = t.aboutCard1Title;
        document.getElementById('about-card1-desc').textContent = t.aboutCard1Desc;
        document.getElementById('about-card2-title').textContent = t.aboutCard2Title;
        document.getElementById('about-card2-desc').textContent = t.aboutCard2Desc;
        document.getElementById('about-card3-title').textContent = t.aboutCard3Title;
        document.getElementById('about-card3-desc').textContent = t.aboutCard3Desc;
        
        document.getElementById('about-quote-txt').textContent = t.aboutQuote;
        
        // Policy Page translations
        document.getElementById('policy-title-lbl').textContent = t.policyTitle;
        document.getElementById('policy-subtitle-lbl').textContent = t.policySubtitle;
        document.getElementById('policy-rule1-title').textContent = t.policyCard1Title;
        document.getElementById('policy-rule1-desc').textContent = t.policyCard1Desc;
        document.getElementById('policy-rule2-title').textContent = t.policyCard2Title;
        document.getElementById('policy-rule2-desc').textContent = t.policyCard2Desc;
        document.getElementById('policy-rule3-title').textContent = t.policyCard3Title;
        document.getElementById('policy-rule3-desc').textContent = t.policyCard3Desc;
        document.getElementById('policy-rule4-title').textContent = t.policyCard4Title;
        document.getElementById('policy-rule4-desc').textContent = t.policyCard4Desc;
    }

    // Initialize Active Language
    const savedLang = localStorage.getItem('appLanguage') || 'en';
    if (savedLang !== 'en') {
        // Set active language text in UI
        const matchedOption = Array.from(langOptions).find(opt => opt.getAttribute('data-lang') === savedLang);
        if (matchedOption) {
            langOptions.forEach(opt => opt.classList.remove('active'));
            matchedOption.classList.add('active');
            currentLangText.textContent = matchedOption.textContent.split(' ')[0];
        }
        applyTranslations(savedLang);
    }

    // Generate Infinite Loop Left-To-Right Book Showcase
    function buildFeaturedCarousel(books) {
        if (!carouselTrack) return;
        carouselTrack.innerHTML = '';
        
        // Take up to 6 books to showcase
        const featuredList = books.slice(0, 6);
        if (featuredList.length === 0) return;
        
        featuredList.forEach(book => {
            const card = document.createElement('div');
            card.className = 'featured-card';
            
            let coverHtml = '';
            if (book.cover_url) {
                coverHtml = `<img src="${book.cover_url}" class="featured-cover" alt="${book.title}">`;
            } else {
                coverHtml = `
                    <div class="featured-cover" style="background: var(--gold-gradient); display: flex; align-items: center; justify-content: center; color: white; font-family: var(--font-heading); font-size: 0.55rem; font-weight: 700; text-align: center; padding: 2px;">
                        ${book.category.split(' ')[0]}
                    </div>
                `;
            }
            
            card.innerHTML = `
                ${coverHtml}
                <div class="featured-info">
                    <div class="featured-title" title="${book.title}">${book.title}</div>
                    <div class="featured-author">by ${book.author}</div>
                    <span class="featured-badge"><i class="fas fa-star" style="font-size: 0.6rem;"></i> Featured</span>
                </div>
            `;
            
            carouselTrack.appendChild(card);
        });
        
        // Duplicate cards so that marquee scroll has gapless looping coverage!
        const duplicatedCards = carouselTrack.innerHTML;
        carouselTrack.innerHTML = duplicatedCards + duplicatedCards;
    }

    // ==========================================
    // STUDENT DIGITAL LIBRARY CARD WIDGET SYSTEM
    // ==========================================

    // Fetch and draw Student Library Card based on localStorage & database
    function updateStudentCardWidget() {
        if (!sidebarCardContainer) return;
        
        // If not logged in as student, guide them to login first
        if (!isStudentLoggedIn) {
            sidebarCardContainer.innerHTML = `
                <div class="apply-card-widget">
                    <h3>Digital Library Card</h3>
                    <p>Unlock your personalized digital library card. Please login as a student to apply.</p>
                    <button class="btn-apply-card" id="btn-trigger-student-login">Login as Student</button>
                </div>
            `;
            document.getElementById('btn-trigger-student-login').addEventListener('click', () => {
                studentLoginModal.classList.add('active');
                studentUsernameInput.focus();
            });
            return;
        }
        
        const myStudentId = localStorage.getItem('myStudentId');
        
        if (!myStudentId) {
            // Render basic application prompt box pre-filled with student's logged in info
            sidebarCardContainer.innerHTML = `
                <div class="apply-card-widget">
                    <h3>Digital Library Card</h3>
                    <p>Welcome, ${studentName}! Apply for a secure institutional card to unlock full library access and dashboard privileges.</p>
                    <button class="btn-apply-card" id="btn-trigger-card-apply">Apply Now</button>
                </div>
            `;
            
            document.getElementById('btn-trigger-card-apply').addEventListener('click', () => {
                cardApplyModal.classList.add('active');
                // Pre-fill fields
                document.getElementById('apply-student-name').value = studentName;
                document.getElementById('apply-student-id').value = studentId;
            });
            return;
        }
        
        // Fetch card status from server
        fetch(`/api/card/status/${encodeURIComponent(myStudentId)}`)
            .then(res => res.json())
            .then(card => {
                if (card.status === 'none') {
                    // Reset localStorage state as it doesn't match backend database
                    localStorage.removeItem('myStudentId');
                    updateStudentCardWidget();
                } else if (card.status === 'pending') {
                    // Render Brushed Steel Pending card
                    sidebarCardContainer.innerHTML = `
                        <div class="pending-card-widget">
                            <h3>Atlas Digital Card</h3>
                            <p style="margin-top: 4px; font-weight: 700;">${card.student_name}</p>
                            <p style="font-size: 0.65rem; font-family: monospace; color: var(--gold-primary);">${card.student_id}</p>
                            <span class="pending-card-watermark"><i class="fas fa-hourglass-half"></i> Pending Review</span>
                        </div>
                    `;
                } else if (card.status === 'rejected') {
                    // Render Rejected Box
                    sidebarCardContainer.innerHTML = `
                        <div class="apply-card-widget" style="border-color: #dc3545;">
                            <h3 style="color: #dc3545;">Application Declined</h3>
                            <p>Your library card application was rejected. Please verify your student credentials and re-submit.</p>
                            <button class="btn-apply-card" id="btn-trigger-card-reapply" style="background: #dc3545;">Re-apply</button>
                        </div>
                    `;
                    
                    document.getElementById('btn-trigger-card-reapply').addEventListener('click', () => {
                        localStorage.removeItem('myStudentId');
                        cardApplyModal.classList.add('active');
                    });
                } else if (card.status === 'approved') {
                    // Render Glowing 3D Digital Student Card!
                    const formattedBarcodeVal = card.student_id.replace('STU-', '').replace('-', '');
                    
                    sidebarCardContainer.innerHTML = `
                        <div class="digital-student-card" title="Your Institutional Digital Card">
                            <div class="student-card-header">
                                <div class="student-card-logo">Atlas<span>Library</span></div>
                                <div class="student-card-chip"></div>
                            </div>
                            
                            <div class="student-card-body">
                                <div class="student-card-details">
                                    <div class="student-card-name">${card.student_name}</div>
                                    <div class="student-card-id">${card.student_id}</div>
                                    <div class="student-card-dept">${card.department}</div>
                                </div>
                                
                                <div class="student-card-barcode-area">
                                    <div class="student-card-barcode"></div>
                                    <div class="student-card-barcode-text">${formattedBarcodeVal}</div>
                                </div>
                            </div>
                            
                            <div class="student-card-footer">
                                <span>STATUS: ACTIVE MEMBER</span>
                                <span>VALID THRU: 2027</span>
                            </div>
                        </div>
                    `;
                    
                    // Add modern 3D mousemove tilting effects!
                    const targetCard = sidebarCardContainer.querySelector('.digital-student-card');
                    if (targetCard) {
                        targetCard.addEventListener('mousemove', (e) => {
                            const rect = targetCard.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            
                            const midX = rect.width / 2;
                            const midY = rect.height / 2;
                            
                            const angleY = (x - midX) / 8;
                            const angleX = -(y - midY) / 6;
                            
                            targetCard.style.transform = `perspective(1000px) rotateY(${angleY}deg) rotateX(${angleX}deg) translateY(-4px)`;
                        });
                        
                        targetCard.addEventListener('mouseleave', () => {
                            targetCard.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0)';
                        });
                    }
                }
            })
            .catch(err => console.error('Error fetching student card status:', err));
    }

    // Toggle card apply modals
    const closeCardApply = () => {
        cardApplyModal.classList.remove('active');
        cardApplyForm.reset();
    };

    if (closeCardApplyBtn) closeCardApplyBtn.addEventListener('click', closeCardApply);
    if (cancelCardApplyBtn) cancelCardApplyBtn.addEventListener('click', closeCardApply);

    // Card application form submit handler
    if (cardApplyForm) {
        cardApplyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const studentName = document.getElementById('apply-student-name').value.trim();
            const studentId = document.getElementById('apply-student-id').value.trim();
            const email = document.getElementById('apply-student-email').value.trim();
            const department = document.getElementById('apply-student-dept').value;

            if (!studentName || !studentId || !email || !department) {
                showToast('Please fill out all fields.', 'error');
                return;
            }

            fetch('/api/card/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_name: studentName,
                    student_id: studentId,
                    email: email,
                    department: department
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    showToast(data.error, 'error');
                } else {
                    showToast(data.message, 'success');
                    localStorage.setItem('myStudentId', studentId);
                    closeCardApply();
                    updateStudentCardWidget();
                    
                    // If admin drawer is active, refresh requests
                    if (isAdmin && activeTab === 'card-applications') {
                        fetchCardApplications();
                    }
                }
            })
            .catch(err => {
                console.error('Error submitting card application:', err);
                showToast('Failed to connect to the server.', 'error');
            });
        });
    }

    // Trigger Initial Library Card widget build
    updateStudentCardWidget();

    // ===============================================
    // ADMIN CARD APPLICATION AUDITING CONSOLE
    // ===============================================

    // Fetch pending card requests from server
    function fetchCardApplications() {
        if (!isAdmin) return;
        
        cardApplicationsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--gold-primary); margin-bottom: 8px;"></i>
                <p>Loading card requests...</p>
            </div>
        `;
        
        fetch('/api/admin/card-applications')
            .then(res => res.json())
            .then(apps => {
                cardApplicationsList.innerHTML = '';
                const pendingApps = apps.filter(a => a.status === 'pending');
                
                if (pendingApps.length === 0) {
                    cardApplicationsList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-id-card empty-state-icon" style="font-size: 1.8rem;"></i>
                            <p style="font-size: 0.9rem;">No pending card requests recorded.</p>
                        </div>
                    `;
                    return;
                }
                
                pendingApps.forEach(app => {
                    const li = document.createElement('li');
                    li.className = 'shelf-item';
                    li.innerHTML = `
                        <div class="shelf-item-cover" style="background: var(--gold-gradient); display: flex; align-items: center; justify-content: center; color: white; font-family: var(--font-heading); font-size: 0.6rem; padding: 2px;">
                            ID Card
                        </div>
                        <div class="shelf-item-details">
                            <h4 class="shelf-item-title">${app.student_name}</h4>
                            <p class="shelf-item-author">${app.email}</p>
                            <p class="shelf-item-borrower">ID: <strong>${app.student_id}</strong> | Dept: ${app.department}</p>
                            <div class="shelf-item-meta" style="margin-top: 6px; gap: 8px;">
                                <button class="btn-accept-request" data-app-id="${app.id}">Accept</button>
                                <button class="btn-reject-request" data-app-id="${app.id}">Reject</button>
                            </div>
                        </div>
                    `;
                    
                    // Bind Accept application
                    li.querySelector('.btn-accept-request').addEventListener('click', () => {
                        auditCardApplication(app.id, 'approved');
                    });
                    
                    // Bind Reject application
                    li.querySelector('.btn-reject-request').addEventListener('click', () => {
                        auditCardApplication(app.id, 'rejected');
                    });
                    
                    cardApplicationsList.appendChild(li);
                });
            })
            .catch(err => console.error('Error fetching card requests:', err));
    }

    // Send Acceptance / Rejection request to API
    function auditCardApplication(appId, status) {
        fetch(`/api/admin/card-application/${appId}/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast(data.message, 'success');
                fetchCardApplications();
                updateStudentCardWidget(); // Instantly update active widget
            }
        })
        .catch(err => {
            console.error('Error auditing card application:', err);
            showToast('Failed to connect to the server.', 'error');
        });
    }

    // Drawer Card applications tab select click binding
    if (tabCardApplications) {
        tabCardApplications.addEventListener('click', () => {
            activeTab = 'card-applications';
            
            // Swap active classes
            document.querySelectorAll('.shelf-tab').forEach(t => t.classList.remove('active'));
            tabCardApplications.classList.add('active');
            
            document.querySelectorAll('.shelf-content-pane').forEach(p => p.classList.remove('active'));
            paneCardApplications.classList.add('active');
            
            fetchCardApplications();
        });
    }

    // API Interaction Functions
    function fetchCategories() {
        fetch('/api/categories')
            .then(res => res.json())
            .then(categories => {
                categoryList.innerHTML = '';
                categories.forEach(cat => {
                    const li = document.createElement('li');
                    li.className = `category-item ${cat.name === currentCategory ? 'active' : ''}`;
                    li.innerHTML = `
                        <span>${cat.name}</span>
                        <span class="category-count">${cat.count}</span>
                    `;
                    li.addEventListener('click', () => {
                        currentCategory = cat.name;
                        // update active UI state
                        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
                        li.classList.add('active');
                        fetchBooks();
                    });
                    categoryList.appendChild(li);
                });
            })
            .catch(err => console.error('Error fetching categories:', err));
    }

    function fetchStats() {
        fetch('/api/stats')
            .then(res => res.json())
            .then(stats => {
                statsTotal.textContent = stats.total_physical;
                statsAvailable.textContent = stats.available_books;
                statsIssued.textContent = stats.issued_books;
                statsOverdue.textContent = stats.overdue_books;
            })
            .catch(err => console.error('Error fetching stats:', err));
    }

    function fetchBooks() {
        // Show loading state
        bookGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--gold-primary); margin-bottom: 10px;"></i>
                <p>Curating your collection...</p>
            </div>
        `;
        
        let url = `/api/books?category=${encodeURIComponent(currentCategory)}`;
        if (searchQuery) {
            url += `&q=${encodeURIComponent(searchQuery)}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(books => {
                bookGrid.innerHTML = '';
                
                // Build the featured masterpieces auto-sliding carousel track!
                buildFeaturedCarousel(books);
                
                if (books.length === 0) {
                    bookGrid.innerHTML = `
                        <div class="empty-state" style="grid-column: 1/-1;">
                            <i class="fas fa-book-open empty-state-icon"></i>
                            <h3>No Books Found</h3>
                            <p>Try refining your search or choosing a different category.</p>
                        </div>
                    `;
                    return;
                }

                books.forEach(book => {
                    const card = document.createElement('div');
                    card.className = 'book-card';
                    
                    const isAvailable = book.available_copies > 0;
                    const badgeClass = isAvailable ? 'badge-available' : 'badge-issued';
                    const badgeText = isAvailable ? 'Available' : 'Issued';
                    
                    let coverHtml = '';
                    if (book.cover_url) {
                        coverHtml = `<img src="${book.cover_url}" class="book-cover-img" alt="${book.title} Cover">`;
                    } else {
                        coverHtml = `
                            <div class="dynamic-cover">
                                <div class="dynamic-cover-category">${book.category}</div>
                                <div class="dynamic-cover-title">${book.title}</div>
                                <div class="dynamic-cover-author">${book.author}</div>
                            </div>
                        `;
                    }

                    let btnHtml = '';
                    if (isAvailable) {
                        btnHtml = `<button class="action-btn btn-issue" data-id="${book.id}">Issue Book</button>`;
                    } else {
                        btnHtml = `<button class="action-btn btn-disabled" disabled>Unavailable</button>`;
                    }

                    if (isAdmin) {
                        btnHtml += `<button class="action-btn btn-delete admin-only" data-id="${book.id}" style="margin-top: 8px;">
                            <i class="fas fa-trash-alt"></i> Delete Book
                        </button>`;
                    }

                    card.innerHTML = `
                        <div class="book-cover-wrapper">
                            <span class="book-badge ${badgeClass}">${badgeText}</span>
                            ${coverHtml}
                        </div>
                        <div class="book-info">
                            <div class="book-category-tag">${book.category}</div>
                            <h3 class="book-title" title="${book.title}">${book.title}</h3>
                            <div class="book-author">by ${book.author}</div>
                            <p class="book-desc">${book.description || 'No description available.'}</p>
                            <div class="book-stock-info">
                                <span>Total: <strong>${book.total_copies}</strong></span>
                                <span>Available: <strong>${book.available_copies}</strong></span>
                            </div>
                            ${btnHtml}
                        </div>
                    `;

                    // Click event for Issue Button
                    const issueBtn = card.querySelector('.btn-issue');
                    if (issueBtn) {
                        issueBtn.addEventListener('click', () => {
                            openIssueModal(book);
                        });
                    }

                    // Click event for Delete Button
                    if (isAdmin) {
                        const deleteBtn = card.querySelector('.btn-delete');
                        if (deleteBtn) {
                            deleteBtn.addEventListener('click', () => {
                                if (confirm(`Are you sure you want to delete '${book.title}' from the catalog? This will also clear all borrowing history for this book.`)) {
                                    deleteBook(book.id);
                                }
                            });
                        }
                    }

                    bookGrid.appendChild(card);
                });
            })
            .catch(err => {
                console.error('Error fetching books:', err);
                bookGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <i class="fas fa-exclamation-triangle empty-state-icon" style="color: red;"></i>
                        <h3>Failed to Load Books</h3>
                        <p>Something went wrong. Please check your database server status.</p>
                    </div>
                `;
            });
    }

    function deleteBook(bookId) {
        fetch(`/api/admin/delete-book/${bookId}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast(data.message, 'success');
                fetchBooks();
                fetchStats();
                fetchHistory();
                fetchCategories();
            }
        })
        .catch(err => {
            console.error('Error deleting book:', err);
            showToast('Failed to connect to the server.', 'error');
        });
    }

    function openIssueModal(book) {
        modalBookId.value = book.id;
        modalBookTitle.textContent = book.title;
        modalBookAuthor.textContent = `By ${book.author}`;
        modalBookCategory.textContent = book.category;
        
        if (book.cover_url) {
            modalBookCover.src = book.cover_url;
            modalBookCover.style.display = 'block';
        } else {
            modalBookCover.style.display = 'none'; // Fallback
        }
        
        // Pre-fill borrower details if logged in as student!
        if (isStudentLoggedIn) {
            document.getElementById('student-name').value = studentName;
            document.getElementById('student-id').value = studentId;
        } else {
            document.getElementById('student-name').value = '';
            document.getElementById('student-id').value = '';
        }
        
        issueModal.classList.add('active');
    }

    function fetchHistory() {
        fetch('/api/history')
            .then(res => res.json())
            .then(history => {
                renderActiveShelf(history);
                renderHistoryLog(history);
            })
            .catch(err => console.error('Error fetching history:', err));
    }

    function renderActiveShelf(history) {
        activeShelfList.innerHTML = '';
        const activeIssues = history.filter(item => item.status === 'issued');
        
        if (activeIssues.length === 0) {
            activeShelfList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark empty-state-icon" style="font-size: 1.8rem;"></i>
                    <p style="font-size: 0.9rem;">Your shelf is empty.<br>No books are currently issued.</p>
                </div>
            `;
            return;
        }

        activeIssues.forEach(item => {
            const li = document.createElement('li');
            li.className = 'shelf-item';
            
            // Check due status
            const dueDate = new Date(item.due_date);
            const today = new Date();
            // Clear times for date comparisons
            dueDate.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let statusText = '';
            let statusClass = '';
            if (diffDays < 0) {
                statusText = `${Math.abs(diffDays)}d Overdue`;
                statusClass = 'due-late';
            } else if (diffDays === 0) {
                statusText = 'Due Today';
                statusClass = 'due-late';
            } else {
                statusText = `${diffDays} days left`;
                statusClass = 'due-normal';
            }

            let coverHtml = '';
            if (item.cover_url) {
                coverHtml = `<img src="${item.cover_url}" class="shelf-item-cover" alt="Cover">`;
            } else {
                coverHtml = `
                    <div class="shelf-item-cover" style="background: var(--gold-gradient); display: flex; align-items: center; justify-content: center; color: white; font-family: var(--font-heading); font-size: 0.6rem; text-align: center; padding: 2px;">
                        Book
                    </div>
                `;
            }

            li.innerHTML = `
                ${coverHtml}
                <div class="shelf-item-details">
                    <h4 class="shelf-item-title">${item.book_title}</h4>
                    <p class="shelf-item-author">${item.book_author}</p>
                    <p class="shelf-item-borrower">Borrowed by: ${item.student_name} (${item.student_id})</p>
                    <div class="shelf-item-meta">
                        <span class="due-countdown ${statusClass}">${statusText}</span>
                        <button class="btn-return" data-transaction-id="${item.id}">Return</button>
                    </div>
                </div>
            `;

            // Return Event Listener
            const returnBtn = li.querySelector('.btn-return');
            returnBtn.addEventListener('click', () => {
                returnBook(item.id);
            });

            activeShelfList.appendChild(li);
        });
    }

    function renderHistoryLog(history) {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history empty-state-icon" style="font-size: 1.8rem;"></i>
                    <p style="font-size: 0.9rem;">No transactions recorded yet.</p>
                </div>
            `;
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            
            const isIssued = item.status === 'issued';
            const badgeClass = isIssued ? 'badge-issued' : 'badge-available';
            const statusLabel = isIssued ? 'Issued' : 'Returned';
            
            let dateText = `Issued: ${item.issue_date} | Due: ${item.due_date}`;
            if (item.return_date) {
                dateText += ` | Returned: ${item.return_date}`;
            }

            div.innerHTML = `
                <div class="history-header">
                    <span>${item.book_category}</span>
                    <span class="status-badge ${badgeClass}">${statusLabel}</span>
                </div>
                <h4 class="history-title">${item.book_title}</h4>
                <p class="history-details">${item.book_author}</p>
                <p class="history-details" style="font-weight: 600; color: var(--text-primary); margin-top: 4px;">
                    Student: ${item.student_name} (${item.student_id})
                </p>
                <p class="history-details" style="margin-top: 2px;">
                    ${dateText}
                </p>
            `;
            
            historyList.appendChild(div);
        });
    }

    function returnBook(transactionId) {
        fetch('/api/return', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ transaction_id: transactionId })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast(data.message, 'success');
                // Refresh states
                fetchBooks();
                fetchStats();
                fetchHistory();
                fetchCategories();
            }
        })
        .catch(err => {
            console.error('Error returning book:', err);
            showToast('Failed to connect to the server.', 'error');
        });
    }

    // Toast Notifications Engine
    function showToast(message, type = 'success') {
        // Create container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconHtml = '<i class="fas fa-check-circle" style="color: var(--status-available);"></i>';
        if (type === 'error') {
            iconHtml = '<i class="fas fa-exclamation-circle" style="color: var(--status-issued);"></i>';
        }

        toast.innerHTML = `
            ${iconHtml}
            <span>${message}</span>
        `;
        
        container.appendChild(toast);

        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s reverse forwards';
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 4000);
    }

    // ==========================================
    // STUDENT SESSION LOGIN/LOGOUT SYSTEM
    // ==========================================

    function updateStudentLoginUI() {
        if (isStudentLoggedIn) {
            studentLoginText.textContent = `${studentName} (Logout)`;
            studentLoginTab.querySelector('i').className = 'fas fa-sign-out-alt';
        } else {
            studentLoginText.textContent = 'Student Login';
            studentLoginTab.querySelector('i').className = 'fas fa-user-circle';
        }
    }

    updateStudentLoginUI();

    // Student Login Button Tab Trigger
    if (studentLoginTab) {
        studentLoginTab.addEventListener('click', () => {
            if (isStudentLoggedIn) {
                // Logout
                isStudentLoggedIn = false;
                studentName = '';
                studentId = '';
                localStorage.removeItem('isStudentLoggedIn');
                localStorage.removeItem('studentName');
                localStorage.removeItem('studentId');
                localStorage.removeItem('myStudentId');
                updateStudentLoginUI();
                updateStudentCardWidget();
                showToast('Logged out of student account.', 'success');
            } else {
                studentLoginModal.classList.add('active');
                studentUsernameInput.focus();
            }
        });
    }

    const closeStudentModal = () => {
        studentLoginModal.classList.remove('active');
        studentLoginForm.reset();
    };

    if (closeStudentModalBtn) closeStudentModalBtn.addEventListener('click', closeStudentModal);
    if (cancelStudentModalBtn) cancelStudentModalBtn.addEventListener('click', closeStudentModal);

    // Student Login Form Submit
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = studentUsernameInput.value.trim();
            const sid = studentIdInput.value.trim();

            if (!username || !sid) {
                showToast('Please enter both name and student ID.', 'error');
                return;
            }

            isStudentLoggedIn = true;
            studentName = username;
            studentId = sid;
            localStorage.setItem('isStudentLoggedIn', 'true');
            localStorage.setItem('studentName', username);
            localStorage.setItem('studentId', sid);
            localStorage.setItem('myStudentId', sid); // Default check matching ID status
            
            updateStudentLoginUI();
            updateStudentCardWidget();
            closeStudentModal();
            showToast(`Welcome, ${username}!`, 'success');
        });
    }

    // ==========================================
    // DEDICATED ADMIN CIRCULAR PROGRESS DIALS & PANELS
    // ==========================================

    // Helper to animate circular progress bars via stroke-dashoffset transitions
    function animateCircularProgress(barId, valId, percent) {
        const barElement = document.getElementById(barId);
        const valElement = document.getElementById(valId);
        
        if (!barElement || !valElement) return;
        
        const clampedPercent = Math.min(Math.max(percent, 0), 100);
        const circumference = 251.2; // 2 * PI * r = 2 * 3.14 * 40 = 251.2
        const offset = circumference - (clampedPercent / 100) * circumference;
        
        barElement.style.strokeDashoffset = offset;
        valElement.textContent = `${clampedPercent}%`;
    }

    // Main Admin Dashboard UI Render Engine
    function renderAdminDashboard() {
        if (!isAdmin) return;
        
        // Fetch real-time statistics
        fetch('/api/stats')
            .then(res => res.json())
            .then(stats => {
                // Fetch card applications
                fetch('/api/admin/card-applications')
                    .then(res => res.json())
                    .then(apps => {
                        // 1. Applications Approved percentage
                        const totalApps = apps.length;
                        const approvedApps = apps.filter(a => a.status === 'approved').length;
                        const approvedRatio = totalApps > 0 ? Math.round((approvedApps / totalApps) * 100) : 0;
                        
                        // 2. Issued books ratio (issued_books / total_physical)
                        const totalCopies = stats.total_physical || 0;
                        const issuedCopies = stats.issued_books || 0;
                        const issuedRatio = totalCopies > 0 ? Math.round((issuedCopies / totalCopies) * 100) : 0;
                        
                        // 3. Remaining books ratio (available_books / total_physical)
                        const availableCopies = stats.available_books || 0;
                        const remainRatio = totalCopies > 0 ? Math.round((availableCopies / totalCopies) * 100) : 0;
                        
                        // Animate Circular SVGs
                        animateCircularProgress('circle-bar-apps', 'circle-val-apps', approvedRatio);
                        animateCircularProgress('circle-bar-issued', 'circle-val-issued', issuedRatio);
                        animateCircularProgress('circle-bar-remain', 'circle-val-remain', remainRatio);
                        
                        // Render applications list
                        renderAdminCardRequestsList(apps);
                    })
                    .catch(err => console.error('Error fetching admin card apps:', err));
            })
            .catch(err => console.error('Error fetching admin stats:', err));
            
        // Fetch all books for dashboard list
        fetch('/api/books?category=All')
            .then(res => res.json())
            .then(books => {
                renderAdminBooksList(books);
            })
            .catch(err => console.error('Error fetching books for admin dashboard list:', err));
            
        // Fetch complete transaction history for logs panel
        fetch('/api/history')
            .then(res => res.json())
            .then(history => {
                renderAdminHistoryList(history);
            })
            .catch(err => console.error('Error fetching admin history:', err));
    }

    // Render Transaction & Borrowing History in Admin View
    function renderAdminHistoryList(history) {
        const adminHistoryList = document.getElementById('admin-history-list');
        if (!adminHistoryList) return;
        
        adminHistoryList.innerHTML = '';
        
        if (history.length === 0) {
            adminHistoryList.innerHTML = `
                <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
                    <i class="fas fa-history" style="font-size: 2rem; color: var(--gold-secondary); margin-bottom: 8px;"></i>
                    <p>No transaction logs recorded yet.</p>
                </div>
            `;
            return;
        }
        
        history.forEach(item => {
            const row = document.createElement('div');
            row.className = 'admin-book-item';
            row.style.marginBottom = '8px';
            row.style.padding = '12px 18px';
            
            const isIssued = item.status === 'issued';
            const badgeClass = isIssued ? 'badge-issued' : 'badge-available';
            const statusLabel = isIssued ? 'Issued / Active' : 'Returned / Closed';
            
            let dateDetails = `<strong>Issued:</strong> ${item.issue_date} | <strong>Due:</strong> ${item.due_date}`;
            if (item.return_date) {
                dateDetails += ` | <strong>Returned:</strong> ${item.return_date}`;
            }
            
            row.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; gap: 20px;">
                    <div style="flex-grow: 1;">
                        <span style="font-size: 0.7rem; color: var(--gold-primary); text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">
                            ${item.book_category || 'CATALOG'}
                        </span>
                        <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 2px 0 4px 0;">
                            ${item.book_title}
                        </h4>
                        <p style="font-size: 0.8rem; color: var(--text-secondary);">
                            <strong>Reader:</strong> ${item.student_name} (${item.student_id})
                        </p>
                        <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
                            ${dateDetails}
                        </p>
                    </div>
                    <div style="flex-shrink: 0; text-align: right;">
                        <span class="status-badge ${badgeClass}" style="padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; display: inline-block;">
                            ${statusLabel}
                        </span>
                    </div>
                </div>
            `;
            
            adminHistoryList.appendChild(row);
        });
    }

    // Render Student Card Requests List in Admin View
    function renderAdminCardRequestsList(apps) {
        if (!adminCardRequestsList) return;
        
        adminCardRequestsList.innerHTML = '';
        const pendingApps = apps.filter(a => a.status === 'pending');
        
        if (pendingApps.length === 0) {
            adminCardRequestsList.innerHTML = `
                <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
                    <i class="fas fa-id-card-clip" style="font-size: 2rem; color: var(--gold-secondary); margin-bottom: 8px;"></i>
                    <p>No pending student card applications</p>
                </div>
            `;
            return;
        }
        
        pendingApps.forEach(app => {
            const item = document.createElement('div');
            item.className = 'admin-book-item';
            item.style.padding = '12px 16px';
            item.style.marginBottom = '8px';
            
            item.innerHTML = `
                <div class="admin-book-details" style="flex-grow: 1;">
                    <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${app.student_name}</h4>
                    <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                        ID: <strong>${app.student_id}</strong> | Dept: ${app.department}
                    </p>
                    <p style="font-size: 0.7rem; color: var(--text-muted);">${app.email}</p>
                    <div style="display: flex; gap: 8px; margin-top: 8px;">
                        <button class="btn-accept-request" data-id="${app.id}">Accept</button>
                        <button class="btn-reject-request" data-id="${app.id}">Reject</button>
                    </div>
                </div>
            `;
            
            // Wire audits
            item.querySelector('.btn-accept-request').addEventListener('click', () => {
                auditCardApplication(app.id, 'approved');
                setTimeout(renderAdminDashboard, 250);
            });
            
            item.querySelector('.btn-reject-request').addEventListener('click', () => {
                auditCardApplication(app.id, 'rejected');
                setTimeout(renderAdminDashboard, 250);
            });
            
            adminCardRequestsList.appendChild(item);
        });
    }

    // Render Books List in Admin View
    function renderAdminBooksList(books) {
        if (!adminBooksList) return;
        
        adminBooksList.innerHTML = '';
        
        if (books.length === 0) {
            adminBooksList.innerHTML = `
                <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted);">
                    <i class="fas fa-book" style="font-size: 2rem; color: var(--gold-secondary); margin-bottom: 8px;"></i>
                    <p>Library catalog is empty</p>
                </div>
            `;
            return;
        }
        
        books.forEach(book => {
            const item = document.createElement('div');
            item.className = 'admin-book-item';
            item.style.marginBottom = '8px';
            
            item.innerHTML = `
                <div class="admin-book-details">
                    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">${book.title}</h4>
                    <p style="font-size: 0.75rem; color: var(--text-secondary);">By ${book.author} | ${book.category}</p>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                        Stock: Total <strong>${book.total_copies}</strong> | Avail <strong>${book.available_copies}</strong>
                    </p>
                </div>
                <button class="btn-delete" data-id="${book.id}" style="padding: 6px 12px; font-size: 0.75rem; border-radius: 6px;">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            `;
            
            // Wire deletion
            item.querySelector('.btn-delete').addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete '${book.title}'? This will clear all borrowing logs for this book.`)) {
                    deleteBookFromDashboard(book.id);
                }
            });
            
            adminBooksList.appendChild(item);
        });
    }

    // Deletes book from database and refreshes admin panel
    function deleteBookFromDashboard(bookId) {
        fetch(`/api/admin/delete-book/${bookId}`, {
            method: 'DELETE'
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast(data.message, 'success');
                renderAdminDashboard();
                fetchBooks(); // Refresh standard grids too
                fetchStats();
            }
        })
        .catch(err => {
            console.error('Error deleting book:', err);
            showToast('Failed to connect to the server.', 'error');
        });
    }

    // Wire up Add Book Trigger from Admin Dashboard
    if (adminAddBookTrigger) {
        adminAddBookTrigger.addEventListener('click', () => {
            addBookModal.classList.add('active');
        });
    }
});
