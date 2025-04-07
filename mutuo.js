document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mutuo-form');
    const risultati = document.getElementById('risultati');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get input values
        const costoTotale = parseFloat(document.getElementById('costoTotale').value);
        const percentualeMutuo = parseFloat(document.getElementById('percentualeMutuo').value);
        const tassoInteresse = parseFloat(document.getElementById('tassoInteresse').value);
        const durata = parseInt(document.getElementById('durata').value);
        const speseAcquisto = parseFloat(document.getElementById('speseAcquisto').value);

        // Validate inputs
        if (percentualeMutuo < 0 || percentualeMutuo > 100) {
            alert('La percentuale del mutuo deve essere tra 0 e 100');
            return;
        }
        if (speseAcquisto < 0 || speseAcquisto > 100) {
            alert('Le spese di acquisto devono essere tra 0 e 100');
            return;
        }
        if (tassoInteresse < 0 || tassoInteresse > 20) {
            alert('Il tasso di interesse deve essere tra 0 e 20%');
            return;
        }
        if (durata < 1 || durata > 40) {
            alert('La durata del mutuo deve essere tra 1 e 40 anni');
            return;
        }

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

        // Save data to localStorage for the comparison calculator
        const mutuoData = {
            costoTotale: costoTotale,
            percentualeMutuo: percentualeMutuo,
            tassoInteresse: tassoInteresse,
            durata: durata,
            speseAcquisto: speseAcquisto,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('mutuoData', JSON.stringify(mutuoData));

        // Display results
        document.getElementById('importoMutuo').textContent = importoMutuo.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('anticipo').textContent = anticipo.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('rataMensile').textContent = rataMensile.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('totaleInteressi').textContent = totaleInteressi.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('speseTotali').textContent = speseTotali.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('totaleRimborso').textContent = (totaleRimborso + speseTotali + anticipo).toLocaleString('it-IT', {maximumFractionDigits: 2});

        // Show results section
        risultati.classList.remove('hidden');
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
            if (this.id === 'durata') {
                if (this.value > 40) this.value = 40;
                if (this.value < 1) this.value = 1;
            }
        });
    });
});