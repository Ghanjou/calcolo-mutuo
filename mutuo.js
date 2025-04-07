document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mutuoForm');
    const results = document.getElementById('risultati');
    const durataSlider = document.getElementById('durata');
    const durataDisplay = document.getElementById('durataDisplay');

    // Aggiorna il display della durata quando il cursore viene spostato
    durataSlider.addEventListener('input', function() {
        durataDisplay.textContent = this.value;
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validazione input
        const importoMutuo = parseFloat(document.getElementById('importoMutuo').value);
        const tassoInteresse = parseFloat(document.getElementById('tassoInteresse').value);
        const durata = parseInt(document.getElementById('durata').value);
        const primaCasa = document.getElementById('primaCasa').checked;

        if (isNaN(importoMutuo) || importoMutuo <= 0) {
            alert('Per favore, inserisci un importo del mutuo valido');
            return;
        }

        if (isNaN(tassoInteresse) || tassoInteresse < 0 || tassoInteresse > 20) {
            alert('Il tasso di interesse deve essere compreso tra 0 e 20%');
            return;
        }

        if (isNaN(durata) || durata < 5 || durata > 40) {
            alert('La durata del mutuo deve essere compresa tra 5 e 40 anni');
            return;
        }

        // Calcolo rata mensile
        const tassoMensile = tassoInteresse / 100 / 12;
        const numeroRate = durata * 12;
        const rataMensile = importoMutuo * (tassoMensile * Math.pow(1 + tassoMensile, numeroRate)) / (Math.pow(1 + tassoMensile, numeroRate) - 1);

        // Calcolo totale interessi
        const totaleInteressi = (rataMensile * numeroRate) - importoMutuo;

        // Calcolo risparmio fiscale
        const maxInteressiDeducibili = 4000;
        const interessiAnno = totaleInteressi / durata;
        const baseDetrazione = Math.min(interessiAnno, maxInteressiDeducibili);
        const risparmioFiscaleAnnuo = primaCasa ? baseDetrazione * 0.19 : 0;
        const risparmioFiscaleTotale = risparmioFiscaleAnnuo * durata;

        // Aggiorna i risultati
        document.getElementById('rataMensile').textContent = rataMensile.toFixed(2) + ' €';
        document.getElementById('totaleInteressi').textContent = totaleInteressi.toFixed(2) + ' €';
        document.getElementById('risparmioFiscaleAnnuo').textContent = (primaCasa ? '760,00' : '0,00') + ' €';
        document.getElementById('risparmioFiscaleTotale').textContent = risparmioFiscaleTotale.toFixed(2) + ' €';

        // Salva i dati nel localStorage
        const datiMutuo = {
            importoMutuo,
            tassoInteresse,
            durata,
            primaCasa,
            rataMensile,
            totaleInteressi,
            risparmioFiscaleAnnuo,
            risparmioFiscaleTotale
        };
        localStorage.setItem('datiMutuo', JSON.stringify(datiMutuo));

        // Mostra i risultati
        results.classList.remove('hidden');
    });
});