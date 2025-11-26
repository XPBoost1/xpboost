document.addEventListener('DOMContentLoaded', () => {
    // Filtering Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projects.forEach(project => {
                if (filter === 'all' || project.getAttribute('data-category') === filter) {
                    project.style.display = 'flex';
                    setTimeout(() => {
                        project.style.opacity = '1';
                        project.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    project.style.opacity = '0';
                    project.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        project.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Modal Logic
    const modalBackdrop = document.getElementById('project-modal');
    const modalCloseBtn = document.querySelector('.modal-close');
    const viewButtons = document.querySelectorAll('.view-project-btn');

    // Modal Elements to Update
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalDesc = document.getElementById('modal-desc');
    const modalClient = document.getElementById('modal-client');
    const modalDate = document.getElementById('modal-date');
    const modalRole = document.getElementById('modal-role');
    const modalIcon = document.getElementById('modal-icon');
    const modalTags = document.getElementById('modal-tags');

    // Open Modal
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent bubbling if card is clicked

            const card = btn.closest('.project-card');
            const data = {
                title: card.dataset.title,
                category: card.dataset.categoryDisplay,
                desc: card.dataset.desc,
                client: card.dataset.client,
                date: card.dataset.date,
                role: card.dataset.role,
                icon: card.dataset.icon,
                tags: card.dataset.tags.split(',')
            };

            // Populate Modal
            modalTitle.textContent = data.title;
            modalCategory.textContent = data.category;
            modalDesc.textContent = data.desc;
            modalClient.textContent = data.client;
            modalDate.textContent = data.date;
            modalRole.textContent = data.role;

            // Update Icon
            // Update Icon or Image
            if (data.icon.includes('/') || data.icon.startsWith('http')) {
                modalIcon.innerHTML = `<img src="${data.icon}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
            } else {
                modalIcon.innerHTML = `<i data-lucide="${data.icon}" style="width: 80px; height: 80px; color: var(--primary);"></i>`;
                lucide.createIcons();
            }

            // Update Tags
            modalTags.innerHTML = data.tags.map(tag => `<span class="tag">${tag.trim()}</span>`).join('');

            // Show Modal
            modalBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close Modal Function
    const closeModal = () => {
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Close Event Listeners
    modalCloseBtn.addEventListener('click', closeModal);

    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
            closeModal();
        }
    });
});
