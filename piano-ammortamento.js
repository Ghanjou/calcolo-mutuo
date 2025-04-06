document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pianoAmmortamentoForm');
    const risultati = document.getElementById('risultati');
    const durataSlider = document.getElementById('durata');
    const durataDisplay = document.getElementById('durataDisplay');

    // Update duration display when slider moves
    durataSlider.addEventListener('input', function() {
        durataDisplay.textContent = this.value;
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get input values
        const importoMutuo = parseFloat(document.getElementById('importoMutuo').value);
        const tassoInteresse = parseFloat(document.getElementById('tassoInteresse').value);
        const durata = parseInt(document.getElementById('durata').value);
        const aliquotaIrpef = parseFloat(document.getElementById('aliquotaIrpef').value);
        const primaCasa = document.getElementById('primaCasa').checked;

        // Validate inputs
        if (importoMutuo <= 0) {
            alert('L\'importo del mutuo deve essere maggiore di 0');
            return;
        }
        if (tassoInteresse < 0 || tassoInteresse > 20) {
            alert('Il tasso di interesse deve essere tra 0 e 20%');
            return;
        }
        if (aliquotaIrpef < 0 || aliquotaIrpef > 100) {
            alert('L\'aliquota IRPEF deve essere tra 0 e 100%');
            return;
        }

        // Calculate monthly payment
        const tassoMensile = (tassoInteresse / 100) / 12;
        const numeroRate = durata * 12;
        const rataMensile = importoMutuo * 
            (tassoMensile * Math.pow(1 + tassoMensile, numeroRate)) / 
            (Math.pow(1 + tassoMensile, numeroRate) - 1);

        // Calculate amortization plan
        let capitaleResiduo = importoMutuo;
        let totaleInteressi = 0;
        let pianoAmmortamento = [];
        let interessiAnnoCorrente = 0;
        let annoCorrente = 1;

        for (let i = 1; i <= numeroRate; i++) {
            const interessi = capitaleResiduo * tassoMensile;
            const quotaCapitale = rataMensile - interessi;
            
            capitaleResiduo -= quotaCapitale;
            totaleInteressi += interessi;
            interessiAnnoCorrente += interessi;

            // At the end of each year, add to the amortization plan
            if (i % 12 === 0 || i === numeroRate) {
                const detrazione = primaCasa ? Math.min(interessiAnnoCorrente, 4000) * 0.19 : 0;
                const risparmioFiscale = detrazione * (aliquotaIrpef / 100);

                pianoAmmortamento.push({
                    anno: annoCorrente,
                    interessiPassivi: interessiAnnoCorrente,
                    detrazione: detrazione,
                    risparmioFiscale: risparmioFiscale
                });

                interessiAnnoCorrente = 0;
                annoCorrente++;
            }
        }

        // Display results
        document.getElementById('rataMensile').textContent = rataMensile.toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' €';
        document.getElementById('totaleInteressi').textContent = totaleInteressi.toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' €';

        // Calculate and display tax savings
        const maxDetrazioneAnnuo = primaCasa ? 4000 * 0.19 : 0;
        const maxRisparmioFiscaleAnnuo = maxDetrazioneAnnuo * (aliquotaIrpef / 100);
        const risparmioFiscaleTotale = pianoAmmortamento.reduce((sum, anno) => sum + anno.risparmioFiscale, 0);

        document.getElementById('risparmioFiscaleAnnuo').textContent = maxRisparmioFiscaleAnnuo.toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' €';
        document.getElementById('risparmioFiscaleTotale').textContent = risparmioFiscaleTotale.toLocaleString('it-IT', {maximumFractionDigits: 2}) + ' €';

        // Display amortization table
        const tabellaAmmortamento = document.getElementById('tabellaAmmortamento');
        tabellaAmmortamento.innerHTML = '';

        pianoAmmortamento.forEach(anno => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${anno.anno}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${anno.interessiPassivi.toLocaleString('it-IT', {maximumFractionDigits: 2})} €</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${anno.detrazione.toLocaleString('it-IT', {maximumFractionDigits: 2})} €</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${anno.risparmioFiscale.toLocaleString('it-IT', {maximumFractionDigits: 2})} €</td>
            `;
            tabellaAmmortamento.appendChild(row);
        });

        // Show results section
        risultati.classList.remove('hidden');
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