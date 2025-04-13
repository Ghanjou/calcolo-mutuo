document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM caricato, inizializzazione form...');
    
    const form = document.getElementById('mutuo-form');
    const risultati = document.getElementById('risultati');
    const durataSlider = document.getElementById('durata');
    const durataDisplay = document.getElementById('durataDisplay');

    if (!form || !risultati || !durataSlider || !durataDisplay) {
        console.error('Elementi del form non trovati!');
        return;
    }

    // Aggiungi token CSRF al form
    try {
        const csrfToken = Security.generateCsrfToken();
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
        console.log('Token CSRF aggiunto al form');
    } catch (error) {
        console.error('Errore nell\'aggiunta del token CSRF:', error);
    }

    // Update duration display when slider moves
    durataSlider.addEventListener('input', function() {
        durataDisplay.textContent = this.value;
    });

    // Add click handlers for the duration markers
    const durationMarkers = document.querySelectorAll('.form-group.space-y-2 span');
    durationMarkers.forEach(marker => {
        marker.addEventListener('click', function() {
            const value = parseInt(this.textContent);
            durataSlider.value = value;
            durataDisplay.textContent = value;
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form inviato, elaborazione dati...');

        try {
            // Get input values
            const formData = {
                costoTotale: document.getElementById('costoTotale').value,
                percentualeMutuo: document.getElementById('percentualeMutuo').value,
                tassoInteresse: document.getElementById('tassoInteresse').value,
                durata: document.getElementById('durata').value,
                speseAcquisto: document.getElementById('speseAcquisto').value
            };

            console.log('Dati form:', formData);

            // Validazione form
            const validation = Security.validateForm(formData);
            if (!validation.isValid) {
                console.warn('Validazione fallita:', validation.errors);
                alert(validation.errors.join('\n'));
                return;
            }

            // Sanitizza i dati
            const sanitizedData = {
                costoTotale: Security.sanitizeInput(formData.costoTotale),
                percentualeMutuo: Security.sanitizeInput(formData.percentualeMutuo),
                tassoInteresse: Security.sanitizeInput(formData.tassoInteresse),
                durata: Security.sanitizeInput(formData.durata),
                speseAcquisto: Security.sanitizeInput(formData.speseAcquisto)
            };

            console.log('Dati sanitizzati:', sanitizedData);

            // Converti in numeri
            const costoTotale = parseFloat(sanitizedData.costoTotale);
            const percentualeMutuo = parseFloat(sanitizedData.percentualeMutuo);
            const tassoInteresse = parseFloat(sanitizedData.tassoInteresse);
            const durata = parseInt(sanitizedData.durata);
            const speseAcquisto = parseFloat(sanitizedData.speseAcquisto);

            // Calculate mortgage details
            const importoMutuo = costoTotale * (percentualeMutuo / 100);
            const anticipo = costoTotale - importoMutuo;
            const speseTotali = costoTotale * (speseAcquisto / 100);
            
            // Convert annual interest rate to monthly
            const tassoMensile = (tassoInteresse / 100) / 12;
            
            // Convert years to months
            const numeroRate = durata * 12;

            // Calculate monthly payment using the Italian amortization formula
            const rataMensile = importoMutuo * 
                (tassoMensile * Math.pow(1 + tassoMensile, numeroRate)) / 
                (Math.pow(1 + tassoMensile, numeroRate) - 1);

            // Calculate total amount to be paid
            const totaleRimborso = rataMensile * numeroRate;
            const totaleInteressi = totaleRimborso - importoMutuo;

            console.log('Calcoli completati:', {
                importoMutuo,
                anticipo,
                rataMensile,
                totaleInteressi,
                speseTotali,
                totaleRimborso
            });

            // Salva i dati in modo sicuro
            const mutuoData = {
                costoTotale: costoTotale,
                percentualeMutuo: percentualeMutuo,
                tassoInteresse: tassoInteresse,
                durata: durata,
                speseAcquisto: speseAcquisto,
                timestamp: new Date().toISOString()
            };

            try {
                localStorage.setItem('mutuoData', JSON.stringify(mutuoData));
                console.log('Dati salvati nel localStorage');
            } catch (error) {
                console.error('Errore nel salvataggio dei dati:', error);
            }

            // Display results
            document.getElementById('importoMutuo').textContent = Security.escapeHtml(importoMutuo.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('anticipo').textContent = Security.escapeHtml(anticipo.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('rataMensile').textContent = Security.escapeHtml(rataMensile.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('totaleInteressi').textContent = Security.escapeHtml(totaleInteressi.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('speseTotali').textContent = Security.escapeHtml(speseTotali.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('totaleRimborso').textContent = Security.escapeHtml((totaleRimborso + speseTotali + anticipo).toLocaleString('it-IT', {maximumFractionDigits: 2}));

            // Show results section with animation
            risultati.classList.remove('hidden');
            setTimeout(() => {
                risultati.classList.add('show');
            }, 10);
            console.log('Risultati mostrati con successo');

        } catch (error) {
            console.error('Errore durante l\'elaborazione del form:', error);
            alert('Si è verificato un errore durante il calcolo. Si prega di riprovare.');
        }
    });

    // Input validation for number inputs
    const inputs = form.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.id === 'percentualeMutuo' || this.id === 'speseAcquisto') {
                if (this.value > 100) this.value = 100;
                if (this.value < 0) this.value = 0;
            }
            if (this.id === 'tassoInteresse') {
                if (this.value < 0) this.value = 0;
            }
        });
    });

    // Pulizia dati sensibili alla chiusura della pagina
    window.addEventListener('beforeunload', function() {
        try {
            Security.cleanSensitiveData();
            console.log('Dati sensibili puliti');
        } catch (error) {
            console.error('Errore nella pulizia dei dati sensibili:', error);
        }
    });

    console.log('Inizializzazione completata con successo');
});