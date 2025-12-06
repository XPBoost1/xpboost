document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const formError = document.getElementById('formError');
    const formErrorMessage = document.getElementById('formErrorMessage');

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Show error message
    function showError(message) {
        formErrorMessage.textContent = message;
        formError.style.display = 'block';
        lucide.createIcons();
        // Scroll to error
        formError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Hide error message
    function hideError() {
        formError.style.display = 'none';
    }

    // Validate single field
    function validateField(field) {
        const value = field.value.trim();
        const fieldError = field.parentElement.querySelector('.field-error');

        // Reset styles
        field.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        if (fieldError) fieldError.style.display = 'none';

        // Check if empty
        if (!value && field.hasAttribute('required')) {
            field.style.borderColor = '#EF4444';
            if (fieldError) {
                fieldError.textContent = 'This field is required';
                fieldError.style.display = 'block';
            }
            return false;
        }

        // Validate email format
        if (field.type === 'email' && value) {
            if (!emailRegex.test(value)) {
                field.style.borderColor = '#EF4444';
                if (fieldError) {
                    fieldError.textContent = 'Please enter a valid email address';
                    fieldError.style.display = 'block';
                }
                return false;
            }
        }

        // Valid
        field.style.borderColor = 'rgba(34, 197, 94, 0.5)';
        return true;
    }

    // Real-time validation on blur
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));

        // Remove error styling on input
        input.addEventListener('input', () => {
            if (input.style.borderColor === 'rgb(239, 68, 68)') {
                input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                const fieldError = input.parentElement.querySelector('.field-error');
                if (fieldError) fieldError.style.display = 'none';
            }
            hideError();
        });

        // Enhanced focus effect
        input.addEventListener('focus', function () {
            this.style.borderColor = 'var(--primary)';
            this.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1)';
        });

        input.addEventListener('blur', function () {
            if (this.style.borderColor !== 'rgb(239, 68, 68)' && this.style.borderColor !== 'rgba(34, 197, 94, 0.5)') {
                this.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }
            this.style.boxShadow = 'none';
        });
    });

    // Form Validation & Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validate all fields
        let isValid = true;

        if (!fullName) {
            validateField(document.getElementById('fullName'));
            isValid = false;
        }

        if (!email) {
            validateField(document.getElementById('email'));
            isValid = false;
        } else if (!emailRegex.test(email)) {
            validateField(document.getElementById('email'));
            isValid = false;
        }

        if (!message) {
            validateField(document.getElementById('message'));
            isValid = false;
        }

        if (!isValid) {
            showError('Please fill in all required fields correctly');
            return;
        }

        // Prepare data
        const formData = {
            fullName: fullName,
            email: email,
            message: message
        };

        // Submit form
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.innerHTML = `
            <i data-lucide="loader-2" class="animate-spin" style="width: 18px; height: 18px;"></i>
            <span>Sending...</span>
        `;
        lucide.createIcons();

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Success State - Replace form with success message
                form.parentElement.innerHTML = `
                    <div style="text-align: center; padding: 4rem 2rem;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 10px 40px rgba(34, 197, 94, 0.2);">
                            <i data-lucide="check" style="width: 40px; height: 40px; color: var(--primary);"></i>
                        </div>
                        <h2 style="font-size: 2rem; margin-bottom: 1rem; background: linear-gradient(135deg, var(--primary), #22c55e); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Message Sent Successfully!</h2>
                        <p style="color: var(--text-muted); margin-bottom: 2.5rem; font-size: 1.125rem; max-width: 500px; margin-left: auto; margin-right: auto;">
                            Thank you for reaching out, ${fullName.split(' ')[0]}! We've received your message and will get back to you within 24 hours.
                        </p>
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                            <a href="index.html" class="btn btn-primary" style="text-decoration: none;">
                                <i data-lucide="home" style="width: 18px; height: 18px;"></i>
                                Back to Home
                            </a>
                            <a href="services.html" class="btn btn-outline" style="text-decoration: none;">
                                <i data-lucide="briefcase" style="width: 18px; height: 18px;"></i>
                                View Services
                            </a>
                        </div>
                    </div>
                `;
                lucide.createIcons();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error:', error);
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            submitBtn.innerHTML = originalHTML;
            lucide.createIcons();
            showError(`Failed to send message: ${error.message}. Please try again or contact us directly.`);
        }
    });
});
