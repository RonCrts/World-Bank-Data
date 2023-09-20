class WorldBankData {
    constructor(country, indicator, startYear, endYear) {
        this.country = country;
        this.indicator = indicator;
        this.startYear = startYear;
        this.endYear = endYear;
    }

    async getData() {
        const url = `https://api.worldbank.org/v2/country/${this.country}/indicator/${this.indicator}?format=json&date=${this.startYear}:${this.endYear}`;
        const response = await fetch(url);
        const data = await response.json();
        return data[1];
    }
}

class WorldBankDataAdapter {
    constructor(worldBankData) {
        this.worldBankData = worldBankData;
        this.chart = null;
    }

    async createGraph() {
        try {
            const data = await this.worldBankData.getData();
            const labels = data.map(datum => datum.date).reverse(); // Invertir el orden de las etiquetas
            const values = data.map(datum => datum.value);
            const chartConfig = {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: this.worldBankData.indicator,
                        data: values,
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        xAxes: [{
                            ticks: {
                                reverse: true
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            };
            const chartContainer = document.createElement('canvas');
            chartContainer.id = 'myChart';
            chartContainer.classList.add('bg-white', 'rounded-md', 'shadow-md');
            const chartParent = document.querySelector('.flex.justify-center');
            chartParent.innerHTML = '';
            chartParent.appendChild(chartContainer);
            if (this.chart) {
                this.chart.destroy();
            }
            this.chart = new Chart(chartContainer, chartConfig);
        } catch (error) {
            console.error(error);
            const errorContainer = document.getElementById('errorContainer');
            errorContainer.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }

    async downloadCsv() {
        try {
            const data = await this.worldBankData.getData();
            const csvContent = "data:text/csv;charset=utf-8," + data.map(datum => `${datum.date},${datum.value}`).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${this.worldBankData.indicator}.csv`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error(error);
            const errorContainer = document.getElementById('errorContainer');
            errorContainer.innerHTML = `<p class="error">${error.message}</p>`;
        }
    }
}

const worldBankData = new WorldBankData('USA', 'SP.POP.TOTL', '1973', '2022');
const worldBankDataAdapter = new WorldBankDataAdapter(worldBankData);

// Generate the graph with the selected indicator
generateGraphBtn.addEventListener('click', async () => {
    try {
        const selectedIndicator = indicatorSelect.value;
        const data = new WorldBankData('USA', selectedIndicator, '1973', '2022');
        const adapter = new WorldBankDataAdapter(data);
        await adapter.createGraph();
    } catch (error) {
        console.error(error);
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
});

// Download the CSV of the selected indicator
downloadCsvBtn.addEventListener('click', async () => {
    try {
        const selectedIndicator = indicatorSelect.value;
        const data = new WorldBankData('USA', selectedIndicator, '1973', '2022');
        const adapter = new WorldBankDataAdapter(data);
        await adapter.downloadCsv();
    } catch (error) {
        console.error(error);
        const errorContainer = document.getElementById('errorContainer');
        errorContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
});

worldBankDataAdapter.createGraph();