// src/components/Charts/SimplePieChart.jsx
import React from 'react';
import {
    PieChart, Pie, Cell,
    Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';
import { TOOLTIP_STYLE, TOOLTIP_ITEM_STYLE } from './chartConfig';

const SimplePieChart = ({
                            data,
                            height = 300,
                            innerRadius = 60,
                            outerRadius = 100,
                        }) => (
    <ResponsiveContainer width="100%" height={height}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
            >
                {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                ))}
            </Pie>
            <Tooltip
                contentStyle={TOOLTIP_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
            />
            <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
            />
        </PieChart>
    </ResponsiveContainer>
);

export default SimplePieChart;