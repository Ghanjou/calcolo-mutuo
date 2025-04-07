document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pianoAmmortamentoForm');
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
        const durata = parseInt(durataSlider.value);
        const primaCasa = document.getElementById('primaCasa').checked;

        if (isNaN(importoMutuo) || isNaN(tassoInteresse) || isNaN(durata)) {
            alert('Per favore, inserisci valori validi');
            return;
        }

        // Calcolo rata mensile
        const tassoMensile = tassoInteresse / 100 / 12;
        const numeroRate = durata * 12;
        const rataMensile = importoMutuo * (tassoMensile * Math.pow(1 + tassoMensile, numeroRate)) / (Math.pow(1 + tassoMensile, numeroRate) - 1);

        // Calcolo piano di ammortamento
        let debitoResiduo = importoMutuo;
        let totaleInteressi = 0;
        let totaleRisparmioFiscale = 0;
        const pianoAmmortamento = [];

        for (let anno = 1; anno <= durata; anno++) {
            let interessiAnno = 0;
            let capitaleRimborsatoAnno = 0;

            for (let mese = 1; mese <= 12; mese++) {
                const interessiMese = debitoResiduo * tassoMensile;
                const capitaleMese = rataMensile - interessiMese;
                
                interessiAnno += interessiMese;
                capitaleRimborsatoAnno += capitaleMese;
                debitoResiduo -= capitaleMese;
            }

            totaleInteressi += interessiAnno;
            
            // Calcolo risparmio fiscale (19% degli interessi, max 4000€ all'anno)
            const baseDetrazione = Math.min(interessiAnno, 4000);
            const risparmioFiscaleAnno = primaCasa ? baseDetrazione * 0.19 : 0;
            totaleRisparmioFiscale += risparmioFiscaleAnno;

            pianoAmmortamento.push({
                anno,
                interessiAnno,
                risparmioFiscaleAnno,
                debitoResiduo
            });
        }

        // Aggiorna i risultati
        document.getElementById('rataMensile').textContent = rataMensile.toFixed(2) + ' €';
        document.getElementById('totaleInteressi').textContent = totaleInteressi.toFixed(2) + ' €';
        document.getElementById('risparmioFiscaleAnnuo').textContent = (primaCasa ? '760,00' : '0,00') + ' €';
        document.getElementById('risparmioFiscaleTotale').textContent = totaleRisparmioFiscale.toFixed(2) + ' €';

        // Aggiorna la tabella
        const tabella = document.getElementById('tabellaAmmortamento');
        tabella.innerHTML = '';
        
        pianoAmmortamento.forEach(anno => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-4 py-2 border">${anno.anno}</td>
                <td class="px-4 py-2 border">${anno.interessiAnno.toFixed(2)} €</td>
                <td class="px-4 py-2 border">${anno.risparmioFiscaleAnno.toFixed(2)} €</td>
                <td class="px-4 py-2 border">${anno.debitoResiduo.toFixed(2)} €</td>
            `;
            tabella.appendChild(row);
        });

        results.classList.remove('hidden');
    });

    // Input validation for number inputs
    const inputs = form.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.id === 'tassoInteresse' || this.id === 'aliquotaIrpef') {
                if (this.value < 0) this.value = 0;
                if (this.id === 'tassoInteresse' && this.value > 20) this.value = 20;
                if (this.id === 'aliquotaIrpef' && this.value > 100) this.value = 100;
            }
        });
    });
}); 