document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const fileInput = document.getElementById('fileInput');
    const fileArea = document.getElementById('fileUploadArea');
    const fileList = document.getElementById('fileList');
    let uploadedFiles = [];

    // File Upload Handling
    fileArea.addEventListener('click', () => fileInput.click());

    fileArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileArea.classList.add('drag-over');
    });

    fileArea.addEventListener('dragleave', () => {
        fileArea.classList.remove('drag-over');
    });

    fileArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!uploadedFiles.some(f => f.name === file.name)) {
                uploadedFiles.push(file);
                addFileToList(file);
            }
        });
    }

    function addFileToList(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <span>${file.name} (${formatSize(file.size)})</span>
            <button type="button" class="remove-file"><i data-lucide="x" style="width:16px;"></i></button>
        `;

        item.querySelector('.remove-file').addEventListener('click', (e) => {
            e.stopPropagation();
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            item.remove();
        });

        fileList.appendChild(item);
        lucide.createIcons();
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

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
            name: form.querySelector('input[placeholder="John Doe"]').value,
            email: form.querySelector('input[type="email"]').value,
            company: form.querySelector('input[placeholder="Company Ltd."]').value,
            budget: form.querySelector('select').value,
            services: Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.parentNode.textContent.trim()),
            message: form.querySelector('textarea').value
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
