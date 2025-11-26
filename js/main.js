/* =========================================
   Main JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Close menu when clicking a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Header Scroll Effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(11, 11, 16, 0.95)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        } else {
            header.style.background = 'rgba(11, 11, 16, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // Dynamic Year
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Quote Wizard Logic (if present)
    initQuoteWizard();

    // Newsletter Subscription
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    newsletterForms.forEach(form => {
        const input = form.querySelector('input[type="email"]');
        const button = form.querySelector('button');

        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = input.value.trim();

            if (!email) {
                input.style.borderColor = '#EF4444';
                return;
            }

            const originalContent = button.innerHTML;
            button.disabled = true;
            button.innerHTML = '<i data-lucide="loader-2" class="animate-spin" style="width: 16px;"></i>';
            lucide.createIcons();

            try {
                const response = await fetch('http://localhost:3000/api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const result = await response.json();

                if (result.success) {
                    button.innerHTML = '<i data-lucide="check" style="width: 16px;"></i>';
                    input.value = '';
                    input.placeholder = 'Subscribed!';
                    setTimeout(() => {
                        button.disabled = false;
                        button.innerHTML = originalContent;
                        input.placeholder = 'Enter email';
                        lucide.createIcons();
                    }, 3000);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                button.disabled = false;
                button.innerHTML = '<i data-lucide="x" style="width: 16px;"></i>';
                setTimeout(() => {
                    button.innerHTML = originalContent;
                    lucide.createIcons();
                }, 2000);
            }
        });
    });
});

function initQuoteWizard() {
    const wizard = document.getElementById('quote-wizard');
    if (!wizard) return;

    const steps = wizard.querySelectorAll('.wizard-step');
    const nextBtns = wizard.querySelectorAll('.btn-next');
    const prevBtns = wizard.querySelectorAll('.btn-prev');
    const progressSteps = document.querySelectorAll('.progress-step');
    let currentStep = 0;

    function showStep(index) {
        steps.forEach((step, i) => {
            if (i === index) {
                step.style.display = 'block';
                setTimeout(() => step.classList.add('active'), 10);
            } else {
                step.classList.remove('active');
                step.style.display = 'none';
            }
        });

        // Update Progress
        progressSteps.forEach((step, i) => {
            if (i <= index) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Scroll to top of form
        wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    });

    // Initial show
    showStep(0);
}

function validateStep(stepIndex) {
    // Simple validation for demo purposes
    // In production, check inputs in the current step
    const step = document.querySelectorAll('.wizard-step')[stepIndex];
    const inputs = step.querySelectorAll('input[required], select[required], textarea[required]');
    let valid = true;

    inputs.forEach(input => {
        if (!input.value) {
            valid = false;
            input.style.borderColor = '#ef4444';

            // Reset border on input
            input.addEventListener('input', () => {
                input.style.borderColor = '';
            });
        }
    });

    if (!valid) {
        // Show toast or error (optional)
        alert('Please fill in all required fields.');
    }

    return valid;
}

// Handle Form Submission
const quoteForm = document.getElementById('quote-wizard');
if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = quoteForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Submitting...';
        submitBtn.disabled = true;

        // Gather form data
        const formData = new FormData(quoteForm);
        const data = Object.fromEntries(formData.entries());

        // Handle multi-select checkboxes (services, secondary_goals) manually
        data.services = Array.from(quoteForm.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);
        data.secondary_goals = Array.from(quoteForm.querySelectorAll('input[name="secondary_goals"]:checked')).map(cb => cb.value);

        try {
            const response = await fetch('/api/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                // Hide form, show success message
                const wizardContainer = document.querySelector('.wizard-container');
                wizardContainer.innerHTML = `
                    <div style="text-align: center; padding: 4rem 2rem; animation: fadeIn 0.5s ease;">
                      <div style="width: 80px; height: 80px; background: rgba(34,197,94,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem;">
                        <i data-lucide="check" style="width: 40px; height: 40px; color: var(--primary);"></i>
                      </div>
                      <h2 style="margin-bottom: 1rem;">Thank You for Your Quote Request!</h2>
                      <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 2rem;">
                        We've received your request and will get back to you within 24 hours with a detailed custom quote tailored to your needs.
                      </p>
                      
                      <div class="card" style="max-width: 500px; margin: 0 auto 2rem; text-align: left;">
                        <h4 style="margin-bottom: 1rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem;">What Happens Next:</h4>
                        <ul style="display: grid; gap: 0.75rem;">
                          <li class="flex items-center gap-2"><i data-lucide="check-circle" class="text-primary" style="width:16px;"></i> <strong>Review</strong> - We'll analyze your requirements (24 hours)</li>
                          <li class="flex items-center gap-2"><i data-lucide="check-circle" class="text-primary" style="width:16px;"></i> <strong>Quote</strong> - You'll receive a detailed proposal (48 hours)</li>
                          <li class="flex items-center gap-2"><i data-lucide="check-circle" class="text-primary" style="width:16px;"></i> <strong>Consultation</strong> - Schedule a call to discuss details</li>
                          <li class="flex items-center gap-2"><i data-lucide="check-circle" class="text-primary" style="width:16px;"></i> <strong>Kickoff</strong> - Start your project with clear milestones</li>
                        </ul>
                      </div>
                      
                      <div class="flex justify-center gap-4">
                        <a href="contact.html" class="btn btn-primary">Schedule Immediate Call</a>
                        <a href="index.html" class="btn btn-outline">Return to Homepage</a>
                      </div>
                      
                      <p style="margin-top: 2rem; font-size: 0.9rem; color: var(--text-muted);">
                        Check your email for a confirmation message with your quote request ID.
                      </p>
                    </div>
                `;

                // Re-initialize icons for the new content
                if (window.lucide) {
                    lucide.createIcons();
                }

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error(result.message || 'Failed to submit quote');
            }
        } catch (error) {
            console.error('Error:', error);
            const submitBtn = document.querySelector('.wizard-footer .btn-primary');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Request <i data-lucide="send"></i>';
                lucide.createIcons();
            }
            alert(`Error: ${error.message}`);
        }
    });
}
