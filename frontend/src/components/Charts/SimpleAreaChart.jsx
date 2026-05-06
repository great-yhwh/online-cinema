// src/components/Charts/SimpleAreaChart.jsx
import React from 'react';
import {
    AreaChart, Area,
    XAxis, YAxis,
    CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    TOOLTIP_STYLE, TOOLTIP_ITEM_STYLE,
    AXIS_PROPS, GRID_PROPS, CHART_MARGIN,
} from './chartConfig';

const SimpleAreaChart = ({
                             data,
                             xKey = 'day',
                             areaKey = 'value',
                             areaName = 'Значение',
                             color = '#8b5cf6',
                             gradientId = 'colorArea',
                             height = 300,
                         }) => (
    <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={CHART_MARGIN}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey={xKey} {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} />
            <Tooltip
                contentStyle={TOOLTIP_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Area
                type="monotone"
                dataKey={areaKey}
                name={areaName}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
            />
        </AreaChart>
    </ResponsiveContainer>
);

export default SimpleAreaChart;