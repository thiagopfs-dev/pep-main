/**
 * Simple Chart component for data visualization
 */

class Chart {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            type: 'bar',
            width: 400,
            height: 300,
            colors: ['#dc2626', '#ea580c', '#d97706', '#10b981', '#3b82f6', '#8b5cf6'],
            ...options
        };
        this.data = [];
    }

    setData(data) {
        this.data = data;
        return this;
    }

    render() {
        this.container.innerHTML = '';
        
        if (!this.data.length) {
            this.container.innerHTML = '<div class="empty-state">Nenhum dado disponível</div>';
            return;
        }

        switch (this.options.type) {
            case 'bar':
                this.renderBarChart();
                break;
            case 'pie':
                this.renderPieChart();
                break;
            case 'line':
                this.renderLineChart();
                break;
            default:
                this.renderBarChart();
        }
    }

    renderBarChart() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.options.width);
        svg.setAttribute('height', this.options.height);
        svg.setAttribute('class', 'chart-svg');

        const maxValue = Math.max(...this.data.map(d => d.value));
        const barWidth = (this.options.width - 100) / this.data.length;
        const chartHeight = this.options.height - 60;

        this.data.forEach((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight;
            const x = 50 + (index * barWidth);
            const y = this.options.height - 40 - barHeight;

            // Bar
            const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bar.setAttribute('x', x + 5);
            bar.setAttribute('y', y);
            bar.setAttribute('width', barWidth - 10);
            bar.setAttribute('height', barHeight);
            bar.setAttribute('fill', this.options.colors[index % this.options.colors.length]);
            bar.setAttribute('rx', 4);
            svg.appendChild(bar);

            // Label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x + barWidth / 2);
            label.setAttribute('y', this.options.height - 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12');
            label.setAttribute('fill', '#64748b');
            label.textContent = item.label;
            svg.appendChild(label);

            // Value
            const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            value.setAttribute('x', x + barWidth / 2);
            value.setAttribute('y', y - 5);
            value.setAttribute('text-anchor', 'middle');
            value.setAttribute('font-size', '12');
            value.setAttribute('font-weight', 'bold');
            value.setAttribute('fill', '#1e293b');
            value.textContent = item.value;
            svg.appendChild(value);
        });

        this.container.appendChild(svg);
    }

    renderPieChart() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.options.width);
        svg.setAttribute('height', this.options.height);
        svg.setAttribute('class', 'chart-svg');

        const centerX = this.options.width / 2;
        const centerY = this.options.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        const total = this.data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;

        this.data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const startAngle = currentAngle;
            const endAngle = currentAngle + sliceAngle;

            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);

            const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = [
                'M', centerX, centerY,
                'L', x1, y1,
                'A', radius, radius, 0, largeArcFlag, 1, x2, y2,
                'Z'
            ].join(' ');

            path.setAttribute('d', d);
            path.setAttribute('fill', this.options.colors[index % this.options.colors.length]);
            path.setAttribute('stroke', '#fff');
            path.setAttribute('stroke-width', 2);
            svg.appendChild(path);

            // Label
            const labelAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius * 0.7;
            const labelX = centerX + labelRadius * Math.cos(labelAngle);
            const labelY = centerY + labelRadius * Math.sin(labelAngle);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', labelX);
            label.setAttribute('y', labelY);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12');
            label.setAttribute('font-weight', 'bold');
            label.setAttribute('fill', '#fff');
            label.textContent = item.value;
            svg.appendChild(label);

            currentAngle = endAngle;
        });

        // Legend
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        legend.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            margin-top: 1rem;
            justify-content: center;
        `;

        this.data.forEach((item, index) => {
            const legendItem = document.createElement('div');
            legendItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
            `;

            const colorBox = document.createElement('div');
            colorBox.style.cssText = `
                width: 16px;
                height: 16px;
                background: ${this.options.colors[index % this.options.colors.length]};
                border-radius: 2px;
            `;

            legendItem.appendChild(colorBox);
            legendItem.appendChild(document.createTextNode(item.label));
            legend.appendChild(legendItem);
        });

        this.container.appendChild(svg);
        this.container.appendChild(legend);
    }

    renderLineChart() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', this.options.width);
        svg.setAttribute('height', this.options.height);
        svg.setAttribute('class', 'chart-svg');

        const maxValue = Math.max(...this.data.map(d => d.value));
        const minValue = Math.min(...this.data.map(d => d.value));
        const chartWidth = this.options.width - 100;
        const chartHeight = this.options.height - 60;

        const points = this.data.map((item, index) => {
            const x = 50 + (index * chartWidth) / (this.data.length - 1);
            const y = 30 + chartHeight - ((item.value - minValue) / (maxValue - minValue)) * chartHeight;
            return { x, y, ...item };
        });

        // Draw line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ');
        line.setAttribute('points', pointsStr);
        line.setAttribute('fill', 'none');
        line.setAttribute('stroke', this.options.colors[0]);
        line.setAttribute('stroke-width', 3);
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(line);

        // Draw points and labels
        points.forEach((point, index) => {
            // Point
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', 4);
            circle.setAttribute('fill', this.options.colors[0]);
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', 2);
            svg.appendChild(circle);

            // Label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', point.x);
            label.setAttribute('y', this.options.height - 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', '12');
            label.setAttribute('fill', '#64748b');
            label.textContent = point.label;
            svg.appendChild(label);

            // Value
            const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            value.setAttribute('x', point.x);
            value.setAttribute('y', point.y - 10);
            value.setAttribute('text-anchor', 'middle');
            value.setAttribute('font-size', '12');
            value.setAttribute('font-weight', 'bold');
            value.setAttribute('fill', '#1e293b');
            value.textContent = point.value;
            svg.appendChild(value);
        });

        this.container.appendChild(svg);
    }
}

// Helper function to create charts
function createChart(containerId, type, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const chart = new Chart(container, { type, ...options });
    return chart.setData(data).render();
}

window.Chart = Chart;
window.createChart = createChart;