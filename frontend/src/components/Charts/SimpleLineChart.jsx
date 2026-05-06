// src/components/Charts/SimpleLineChart.jsx
import React from 'react';
import {
    LineChart, Line,
    XAxis, YAxis,
    CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    TOOLTIP_STYLE, TOOLTIP_ITEM_STYLE,
    AXIS_PROPS, GRID_PROPS, CHART_MARGIN,
} from './chartConfig';

const SimpleLineChart = ({
                             data,
                             xKey = 'day',
                             lineKey = 'value',
                             lineName = 'Значение',
                             color = '#10b981',
                             height = 300,
                         }) => (
    <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey={xKey} {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} />
            <Tooltip
                contentStyle={TOOLTIP_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Line
                type="monotone"
                dataKey={lineKey}
                name={lineName}
                stroke={color}
                strokeWidth={3}
                dot={{
                    r: 4,
                    fill: color,
                    strokeWidth: 2,
                    stroke: '#0f172a',
                }}
                activeDot={{ r: 6 }}
            />
        </LineChart>
    </ResponsiveContainer>
);

export default SimpleLineChart;