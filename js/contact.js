document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');

    // Form Validation & Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Basic Validation
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = '#EF4444';
            } else {
                field.style.borderColor = 'var(--glass-border)';
            }
        });

        if (!isValid) return;

        // Gather Data
        const formData = {
            fullName: form.querySelector('input[name="fullName"]').value,
            email: form.querySelector('input[name="email"]').value,
            phone: form.querySelector('input[name="phone"]').value,
            preferredContact: form.querySelector('select[name="preferredContact"]').value,
            services: Array.from(form.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value),
            message: form.querySelector('textarea[name="message"]').value
        };

        // Simulate Submission
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="animate-spin"></i> Sending...';
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
                // Success State
                form.innerHTML = `
                    <div style="text-align: center; padding: 3rem;">
                        <div style="width: 64px; height: 64px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                            <i data-lucide="check" style="width: 32px; height: 32px; color: var(--primary);"></i>
                        </div>
                        <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Message Sent!</h3>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                        <a href="index.html" class="btn btn-primary">Back to Home</a>
                    </div>
                `;
                lucide.createIcons();
            } else {
                throw new Error(result.message || 'Failed to send');
            }
        } catch (error) {
            console.error('Error:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            alert(`Error: ${error.message}`);
        }
    });
});
