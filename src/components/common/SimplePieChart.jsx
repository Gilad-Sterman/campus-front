import React from 'react';

const SimplePieChart = ({ data, colors }) => {
    // data: { label: string, value: number }[]
    // colors: { [label]: string }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const slices = data.map((item) => {
        if (item.value === 0) return null;

        const startPercent = cumulativePercent;
        const slicePercent = item.value / total;
        cumulativePercent += slicePercent;
        const endPercent = cumulativePercent;

        // SVG path commands
        // M 0 0 : Move to center
        // L ... : Line to start coordinates
        // A ... : Arc to end coordinates
        // L 0 0 : Line back to center

        // Adjust coordinates to start from top (rotate -90deg) by swapping/negating if needed, 
        // but standard math starts from 3 o'clock. 
        // Let's us standard math and rotate the whole SVG or group.

        const [startX, startY] = getCoordinatesForPercent(startPercent);
        const [endX, endY] = getCoordinatesForPercent(endPercent);

        // Large arc flag: if slice > 50%, use 1
        const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

        const pathData = [
            `M 0 0`,
            `L ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
        ].join(' ');

        return (
            <path
                key={item.label}
                d={pathData}
                fill={colors[item.label] || '#ccc'}
            />
        );
    });

    return (
        <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%', maxWidth: '200px', maxHeight: '200px' }}>
            {slices}
        </svg>
    );
};

export default SimplePieChart;
