// security.js
const Security = {
    // Validazione input
    sanitizeInput: function(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/[<>]/g, '');
    },

    // Validazione numeri
    validateNumber: function(value, min, max) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
    },

    // Protezione XSS per HTML
    escapeHtml: function(text) {
        if (typeof text !== 'string') return text;
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // Generazione token CSRF
    generateCsrfToken: function() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // Pulizia dati sensibili
    cleanSensitiveData: function() {
        try {
            localStorage.removeItem('mutuoData');
            sessionStorage.clear();
            document.cookie.split(";").forEach(cookie => {
                document.cookie = cookie
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        } catch (error) {
            console.error('Errore nella pulizia dei dati:', error);
        }
    },

    // Validazione form
    validateForm: function(formData) {
        const errors = [];
        
        // Validazione costoTotale
        if (!this.validateNumber(formData.costoTotale, 5000)) {
            errors.push('Il costo totale deve essere almeno 5.000 €');
        }

        // Validazione percentualeMutuo
        if (!this.validateNumber(formData.percentualeMutuo, 0, 100)) {
            errors.push('La percentuale del mutuo deve essere tra 0 e 100');
        }

        // Validazione tassoInteresse
        if (!this.validateNumber(formData.tassoInteresse, 0, 20)) {
            errors.push('Il tasso di interesse deve essere tra 0 e 20%');
        }

        // Validazione durata
        if (!this.validateNumber(formData.durata, 5, 40)) {
            errors.push('La durata del mutuo deve essere tra 5 e 40 anni');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}; 