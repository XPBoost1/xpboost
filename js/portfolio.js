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
    const modalClient = document.getElementById('modal-client');
    const modalDate = document.getElementById('modal-date');
    const modalRole = document.getElementById('modal-role');
    // modal-icon removed - no longer displaying project image in modal
    const modalTags = document.getElementById('modal-tags');

    // New Case Study Elements
    const modalChallenge = document.getElementById('modal-challenge');
    const modalSolution = document.getElementById('modal-solution');
    const modalBenefits = document.getElementById('modal-benefits');
    const modalReview = document.getElementById('modal-review');
    const modalReviewer = document.getElementById('modal-reviewer');
    const modalReviewerTitle = document.getElementById('modal-reviewer-title');
    const modalReviewerAvatar = document.getElementById('modal-reviewer-avatar');

    // Benefit icons mapping
    const benefitIcons = ['check-circle', 'trending-up', 'zap', 'shield'];

    // Open Modal
    viewButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent bubbling if card is clicked

            const card = btn.closest('.project-card');
            const data = {
                title: card.dataset.title,
                category: card.dataset.categoryDisplay,
                client: card.dataset.client,
                date: card.dataset.date,
                role: card.dataset.role,
                icon: card.dataset.icon,
                tags: card.dataset.tags.split(','),
                challenge: card.dataset.challenge || 'Challenge details coming soon.',
                solution: card.dataset.solution || 'Solution details coming soon.',
                benefits: card.dataset.benefits ? card.dataset.benefits.split('|') : ['Benefit 1', 'Benefit 2', 'Benefit 3', 'Benefit 4'],
                review: card.dataset.review || 'Client review coming soon.',
                reviewer: card.dataset.reviewer || 'Client Name',
                reviewerTitle: card.dataset.reviewerTitle || 'Position'
            };

            // Populate Modal - Basic Info
            modalTitle.textContent = data.title;
            modalCategory.textContent = data.category;
            modalClient.textContent = data.client;
            modalDate.textContent = data.date;
            modalRole.textContent = data.role;
            // Modal image section removed - icon/image no longer displayed

            // Update Tags
            modalTags.innerHTML = data.tags.map(tag => `<span class="tag">${tag.trim()}</span>`).join('');

            // Populate Case Study Sections
            modalChallenge.textContent = data.challenge;
            modalSolution.textContent = data.solution;

            // Populate Benefits
            modalBenefits.innerHTML = data.benefits.map((benefit, index) => `
                <div class="benefit-item">
                    <div class="benefit-icon">
                        <i data-lucide="${benefitIcons[index % benefitIcons.length]}"></i>
                    </div>
                    <span class="benefit-text">${benefit.trim()}</span>
                </div>
            `).join('');

            // Populate Testimonial
            modalReview.textContent = `"${data.review}"`;
            modalReviewer.textContent = data.reviewer;
            modalReviewerTitle.textContent = data.reviewerTitle;

            // Set avatar initial
            if (data.reviewer) {
                modalReviewerAvatar.textContent = data.reviewer.charAt(0).toUpperCase();
            }

            // Reinitialize Lucide icons for new elements
            lucide.createIcons();

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

