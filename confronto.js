document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mutuo-form');
    const risultati = document.getElementById('risultati');
    let costsChart = null;

    function createCostsChart(years, buyingCosts, rentingCosts) {
        const ctx = document.getElementById('costsChart').getContext('2d');
        
        if (costsChart) {
            costsChart.destroy();
        }

        costsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Costi Acquisto',
                        data: buyingCosts,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Costi Affitto',
                        data: rentingCosts,
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += new Intl.NumberFormat('it-IT', {
                                    style: 'currency',
                                    currency: 'EUR'
                                }).format(context.parsed.y);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Anno'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Costi Cumulativi (€)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('it-IT', {
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get input values for mortgage
        const costoTotale = parseFloat(document.getElementById('costoTotale').value);
        const percentualeMutuo = parseFloat(document.getElementById('percentualeMutuo').value);
        const tassoInteresse = parseFloat(document.getElementById('tassoInteresse').value);
        const durata = parseInt(document.getElementById('durata').value);
        const speseAcquisto = parseFloat(document.getElementById('speseAcquisto').value);

        // Get input values for property expenses
        const speseCondominialiAcquisto = parseFloat(document.getElementById('speseCondominialiAcquisto').value);
        const impostaCatastale = parseFloat(document.getElementById('impostaCatastale').value);
        const assicurazioneCasa = parseFloat(document.getElementById('assicurazioneCasa').value);
        const manutenzioneStraordinaria = parseFloat(document.getElementById('manutenzioneStraordinaria').value);

        // Get input values for rent
        const affittoMensile = parseFloat(document.getElementById('affittoMensile').value);
        const aumentoAnnuoAffitto = parseFloat(document.getElementById('aumentoAnnuoAffitto').value);
        const speseCondominiali = parseFloat(document.getElementById('speseCondominiali').value);
        const speseRiscaldamento = parseFloat(document.getElementById('speseRiscaldamento').value);
        const tari = parseFloat(document.getElementById('tari').value);

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

        // Calculate total amount to be paid for mortgage
        const totaleRimborso = rataMensile * numeroRate;
        const totaleInteressi = totaleRimborso - importoMutuo;

        // Calculate total property expenses over the period
        const totaleSpeseCond = speseCondominialiAcquisto * numeroRate;
        const totaleImu = impostaCatastale * durata;
        const totaleAssicurazione = assicurazioneCasa * durata;
        const totaleManutenzione = manutenzioneStraordinaria * durata;

        // Calculate total property costs
        const totaleCostiProprieta = totaleRimborso + speseAcquistoTotali + anticipo + 
            totaleSpeseCond + totaleImu + totaleAssicurazione + totaleManutenzione;

        // Calculate rent costs over the same period
        let totaleAffitto = 0;
        let affittoCorrente = affittoMensile;
        const aumentoMensile = Math.pow(1 + aumentoAnnuoAffitto / 100, 1/12) - 1;
        
        for (let mese = 0; mese < numeroRate; mese++) {
            totaleAffitto += affittoCorrente;
            affittoCorrente *= (1 + aumentoMensile);
        }

        // Calculate total rent expenses
        const totaleSpeseCond_affitto = speseCondominiali * numeroRate;
        const totaleRiscaldamento = speseRiscaldamento * numeroRate;
        const totaleTari = tari * durata;
        const costoTotaleAffitto = totaleAffitto + totaleSpeseCond_affitto + totaleRiscaldamento + totaleTari;
        const affittoFinale = affittoMensile * Math.pow(1 + aumentoAnnuoAffitto / 100, durata);

        // Calculate yearly costs for the graph
        const years = Array.from({length: durata + 1}, (_, i) => i);
        const buyingCosts = [];
        const rentingCosts = [];

        // Initial costs for buying (down payment + purchase expenses)
        let cumulativeBuyingCost = anticipo + speseAcquistoTotali;
        let cumulativeRentingCost = 0;
        
        // Calculate costs for each year
        for (let year = 0; year <= durata; year++) {
            if (year === 0) {
                buyingCosts.push(cumulativeBuyingCost);
                rentingCosts.push(0);
                continue;
            }

            // Add yearly mortgage payments
            cumulativeBuyingCost += rataMensile * 12;
            
            // Add yearly property expenses
            cumulativeBuyingCost += speseCondominialiAcquisto * 12;
            cumulativeBuyingCost += impostaCatastale;
            cumulativeBuyingCost += assicurazioneCasa;
            cumulativeBuyingCost += manutenzioneStraordinaria;

            // Calculate rent for the year with annual increase
            let yearlyRent = 0;
            for (let month = 0; month < 12; month++) {
                const monthFromStart = (year - 1) * 12 + month;
                const currentRent = affittoMensile * Math.pow(1 + aumentoAnnuoAffitto / 100, monthFromStart / 12);
                yearlyRent += currentRent;
            }

            // Add yearly rent expenses
            cumulativeRentingCost += yearlyRent;
            cumulativeRentingCost += speseCondominiali * 12;
            cumulativeRentingCost += speseRiscaldamento * 12;
            cumulativeRentingCost += tari;

            buyingCosts.push(cumulativeBuyingCost);
            rentingCosts.push(cumulativeRentingCost);
        }

        // Create/update the graph
        createCostsChart(years, buyingCosts, rentingCosts);

        // Display mortgage and property results
        document.getElementById('importoTotale').textContent = importoMutuo.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('rataMensile').textContent = rataMensile.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('totaleInteressi').textContent = totaleInteressi.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('totaleSpese').textContent = speseAcquistoTotali.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('speseCondAcquistoDisplay').textContent = speseCondominialiAcquisto.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('imuDisplay').textContent = impostaCatastale.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('assicurazioneDisplay').textContent = assicurazioneCasa.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('manutenzioneDisplay').textContent = manutenzioneStraordinaria.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('totaleCostiProprieta').textContent = totaleCostiProprieta.toLocaleString('it-IT', {maximumFractionDigits: 2});

        // Display rent results
        document.getElementById('affittoInizialeDisplay').textContent = affittoMensile.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('affittoFinaleDisplay').textContent = affittoFinale.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('totaleAffitto').textContent = totaleAffitto.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('speseCondDisplay').textContent = speseCondominiali.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('riscaldamentoDisplay').textContent = speseRiscaldamento.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('tariDisplay').textContent = tari.toLocaleString('it-IT', {maximumFractionDigits: 2});
        document.getElementById('costoTotaleAffitto').textContent = costoTotaleAffitto.toLocaleString('it-IT', {maximumFractionDigits: 2});

        // Compare and display final analysis
        const differenza = totaleCostiProprieta - costoTotaleAffitto;
        const confrontoFinale = document.getElementById('confrontoFinale');
        const confrontoMensile = document.getElementById('confrontoMensile');
        
        // Calculate monthly costs for both scenarios
        const costoMensileAcquisto = (totaleCostiProprieta / numeroRate);
        const costoMensileAffitto = (costoTotaleAffitto / numeroRate);
        
        if (differenza > 0) {
            confrontoFinale.innerHTML = `
                <p class="text-green-600">L'affitto risulta più conveniente di ${differenza.toLocaleString('it-IT', {maximumFractionDigits: 2})} € sul periodo di ${durata} anni.</p>
                <p class="text-sm text-gray-600 mt-2">Tuttavia, considera che con l'acquisto diventerai proprietario dell'immobile.</p>
            `;
        } else {
            confrontoFinale.innerHTML = `
                <p class="text-blue-600">L'acquisto risulta più conveniente di ${Math.abs(differenza).toLocaleString('it-IT', {maximumFractionDigits: 2})} € sul periodo di ${durata} anni.</p>
                <p class="text-sm text-gray-600 mt-2">Inoltre, alla fine del periodo sarai proprietario dell'immobile.</p>
            `;
        }

        confrontoMensile.innerHTML = `
            <p>Costo medio mensile acquisto: ${costoMensileAcquisto.toLocaleString('it-IT', {maximumFractionDigits: 2})} €</p>
            <p>Costo medio mensile affitto: ${costoMensileAffitto.toLocaleString('it-IT', {maximumFractionDigits: 2})} €</p>
        `;

        // Add break-even point analysis
        let breakEvenYear = -1;
        for (let i = 0; i < buyingCosts.length; i++) {
            if (buyingCosts[i] <= rentingCosts[i]) {
                breakEvenYear = i;
                break;
            }
        }

        if (breakEvenYear !== -1) {
            confrontoMensile.innerHTML += `
                <p class="mt-2 text-blue-600">Punto di pareggio: ${breakEvenYear} anni</p>
                <p class="text-sm text-gray-600">Da questo momento in poi, l'acquisto diventa più conveniente dell'affitto.</p>
            `;
        }

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
            if (this.id === 'tassoInteresse' || this.id === 'aumentoAnnuoAffitto') {
                if (this.value < 0) this.value = 0;
            }
        });
    });

    // Add button click handler to load mortgage data
    const caricaDatiMutuo = document.getElementById('caricaDatiMutuo');
    caricaDatiMutuo.addEventListener('click', function() {
        const savedData = localStorage.getItem('mutuoData');
        if (savedData) {
            const mutuoData = JSON.parse(savedData);
            
            // Check if data is from today
            const savedDate = new Date(mutuoData.timestamp);
            const now = new Date();
            const isToday = savedDate.toDateString() === now.toDateString();
            
            if (isToday) {
                // Load the saved data into the form
                document.getElementById('costoTotale').value = mutuoData.costoTotale;
                document.getElementById('percentualeMutuo').value = mutuoData.percentualeMutuo;
                document.getElementById('tassoInteresse').value = mutuoData.tassoInteresse;
                document.getElementById('durata').value = mutuoData.durata;
                document.getElementById('speseAcquisto').value = mutuoData.speseAcquisto;
                
                // Show success message
                alert('Dati caricati con successo dal calcolo mutuo precedente!');
            } else {
                alert('I dati salvati non sono di oggi. Per sicurezza, inserisci nuovamente i dati del mutuo.');
            }
        } else {
            alert('Nessun dato del mutuo trovato. Calcola prima il mutuo nella pagina "Calcola il tuo Mutuo".');
        }
    });
}); 