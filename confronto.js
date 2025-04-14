document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM caricato, inizializzazione form...');
    
    const form = document.getElementById('confronto-form');
    const risultati = document.getElementById('risultati');
    const durataSlider = document.getElementById('durata');
    const durataDisplay = document.getElementById('durataDisplay');

    if (!form || !risultati || !durataSlider || !durataDisplay) {
        console.error('Elementi del form non trovati!');
        return;
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

    let costsChart = null;

    // Add button click handler to load mortgage data
    const caricaDatiMutuo = document.getElementById('caricaDatiMutuo');
    if (caricaDatiMutuo) {
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
    }

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
        console.log('Form inviato, elaborazione dati...');

        try {
            // Get input values
            const formData = {
                costoTotale: document.getElementById('costoTotale').value,
                percentualeMutuo: document.getElementById('percentualeMutuo').value,
                tassoInteresse: document.getElementById('tassoInteresse').value,
                durata: document.getElementById('durata').value,
                speseAcquisto: document.getElementById('speseAcquisto').value,
                affittoMensile: document.getElementById('affittoMensile').value,
                aumentoAnnualeAffitto: document.getElementById('aumentoAnnualeAffitto').value
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
                speseAcquisto: Security.sanitizeInput(formData.speseAcquisto),
                affittoMensile: Security.sanitizeInput(formData.affittoMensile),
                aumentoAnnualeAffitto: Security.sanitizeInput(formData.aumentoAnnualeAffitto)
            };

            console.log('Dati sanitizzati:', sanitizedData);

            // Converti in numeri
            const costoTotale = parseFloat(sanitizedData.costoTotale);
            const percentualeMutuo = parseFloat(sanitizedData.percentualeMutuo);
            const tassoInteresse = parseFloat(sanitizedData.tassoInteresse);
            const durata = parseInt(sanitizedData.durata);
            const speseAcquisto = parseFloat(sanitizedData.speseAcquisto);
            const affittoMensile = parseFloat(sanitizedData.affittoMensile);
            const aumentoAnnualeAffitto = parseFloat(sanitizedData.aumentoAnnualeAffitto);

            // Calcola i costi dell'acquisto
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

            // Calcola i costi dell'affitto
            let totaleAffitto = 0;
            let affittoCorrente = affittoMensile;
            const anni = durata;
            const mesi = anni * 12;

            // Calculate total rent cost with annual increase
            for (let i = 0; i < mesi; i++) {
                if (i > 0 && i % 12 === 0) {
                    affittoCorrente *= (1 + aumentoAnnualeAffitto / 100);
                }
                totaleAffitto += affittoCorrente;
            }

            // Calcola il valore residuo dell'immobile (apprezzamento del 2% annuo)
            const valoreResiduo = costoTotale * Math.pow(1 + 0.02, anni);

            // Calcola il costo netto dell'acquisto
            // Include: anticipo + spese di acquisto + totale rimborso - valore residuo
            const costoNettoAcquisto = anticipo + speseTotali + totaleRimborso - valoreResiduo;

            // Calcola la differenza (positiva se l'affitto è più conveniente)
            const differenza = totaleAffitto - costoNettoAcquisto;

            console.log('Calcoli completati:', {
                importoMutuo,
                anticipo,
                rataMensile,
                totaleInteressi,
                speseTotali,
                totaleRimborso,
                totaleAffitto,
                valoreResiduo,
                costoNettoAcquisto,
                differenza
            });

            // Display results
            document.getElementById('importoMutuo').textContent = Security.escapeHtml(importoMutuo.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('anticipo').textContent = Security.escapeHtml(anticipo.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('rataMensile').textContent = Security.escapeHtml(rataMensile.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('totaleInteressi').textContent = Security.escapeHtml(totaleInteressi.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('speseTotali').textContent = Security.escapeHtml(speseTotali.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('totaleRimborso').textContent = Security.escapeHtml(totaleRimborso.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('totaleAffitto').textContent = Security.escapeHtml(totaleAffitto.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('valoreResiduo').textContent = Security.escapeHtml(valoreResiduo.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('costoNettoAcquisto').textContent = Security.escapeHtml(costoNettoAcquisto.toLocaleString('it-IT', {maximumFractionDigits: 2}));
            document.getElementById('differenza').textContent = Security.escapeHtml(Math.abs(differenza).toLocaleString('it-IT', {maximumFractionDigits: 2}));

            // Update the recommendation
            const raccomandazione = document.getElementById('raccomandazione');
            if (differenza > 0) {
                raccomandazione.textContent = "L'acquisto è più conveniente dell'affitto.";
                raccomandazione.className = "text-green-600 font-semibold";
            } else {
                raccomandazione.textContent = "L'affitto è più conveniente dell'acquisto.";
                raccomandazione.className = "text-blue-600 font-semibold";
            }

            // Show results section with animation
            risultati.classList.remove('hidden');
            setTimeout(() => {
                risultati.classList.add('show');
            }, 10);
            console.log('Risultati mostrati con successo');

            // Calculate costs for each year for the chart
            const years = Array.from({length: anni + 1}, (_, i) => i);
            const buyingCosts = years.map(year => {
                const ratePagate = Math.min(year * 12, numeroRate);
                const valoreResiduoAnno = costoTotale * Math.pow(1 + 0.02, year);
                return anticipo + speseTotali + (rataMensile * ratePagate) - valoreResiduoAnno;
            });

            const rentingCosts = years.map(year => {
                let totale = 0;
                let affittoCorrente = affittoMensile;
                for (let m = 0; m < year * 12; m++) {
                    if (m > 0 && m % 12 === 0) {
                        affittoCorrente *= (1 + aumentoAnnualeAffitto / 100);
                    }
                    totale += affittoCorrente;
                }
                return totale;
            });

            // Update the chart
            createCostsChart(years, buyingCosts, rentingCosts);

        } catch (error) {
            console.error('Errore durante l\'elaborazione del form:', error);
            alert('Si è verificato un errore durante il calcolo. Si prega di riprovare.');
        }
    });

    // Input validation for number inputs
    const inputs = form.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.id === 'percentualeMutuo' || this.id === 'speseAcquisto' || this.id === 'aumentoAnnualeAffitto') {
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