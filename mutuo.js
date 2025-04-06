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

        // Calculate mortgage details
        const importoMutuo = (costoTotale * percentualeMutuo) / 100;
        const anticipo = costoTotale - importoMutuo;
        const speseAcquistoTotali = (costoTotale * speseAcquisto) / 100;
        
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

        // Display results
        document.getElementById('importoTotale').textContent = importoMutuo.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('rataMensile').textContent = rataMensile.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('totaleInteressi').textContent = totaleInteressi.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('totaleSpese').textContent = speseAcquistoTotali.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('totaleRimborso').textContent = (totaleRimborso + speseAcquistoTotali + anticipo).toLocaleString('it-IT', {maximumFractionDigits: 2});

        // Show results section
        risultati.classList.remove('hidden');
    });

    // Input validation
    const inputs = form.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.id === 'percentualeMutuo' || this.id === 'speseAcquisto') {
                if (this.value > 100) this.value = 100;
                if (this.value < 0) this.value = 0;
            }
            if (this.id === 'durata') {
                if (this.value > 40) this.value = 40;
                if (this.value < 1) this.value = 1;
            }
            if (this.id === 'tassoInteresse') {
                if (this.value < 0) this.value = 0;
            }
        });
    });
}); 