// src/components/Charts/SimpleBarChart.jsx
import React from 'react';
import {
    BarChart, Bar,
    XAxis, YAxis,
    CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    TOOLTIP_STYLE, TOOLTIP_ITEM_STYLE,
    AXIS_PROPS, GRID_PROPS, CHART_MARGIN,
} from './chartConfig';

/*
 * data        – массив объектов
 * xKey        – ключ для оси X
 * barKey      – ключ для столбцов
 * barName     – название в тултипе
 * color       – цвет столбцов
 * height      – высота графика
 * xAngle      – угол наклона подписей X (0 | -20 и т.д.)
 * tooltipLabelKey – ключ для полного названия в тултипе
 */
const SimpleBarChart = ({
                            data,
                            xKey = 'name',
                            barKey = 'value',
                            barName = 'Значение',
                            color = '#3b82f6',
                            height = 300,
                            xAngle = 0,
                            tooltipLabelKey,
                        }) => (
    <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis
                dataKey={xKey}
                {...AXIS_PROPS}
                fontSize={11}
                interval={0}
                angle={xAngle}
                textAnchor={xAngle ? 'end' : 'middle'}
                height={xAngle ? 50 : 30}
            />
            <YAxis {...AXIS_PROPS} />
            <Tooltip
                cursor={{ fill: '#334155', opacity: 0.4 }}
                contentStyle={TOOLTIP_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                formatter={(value) => [value, barName]}
                labelFormatter={(label, payload) => {
                    if (tooltipLabelKey && payload?.[0]) {
                        return payload[0].payload[tooltipLabelKey];
                    }
                    return label;
                }}
            />
            <Bar
                dataKey={barKey}
                name={barName}
                fill={color}
                radius={[4, 4, 0, 0]}
            />
        </BarChart>
    </ResponsiveContainer>
);

export default SimpleBarChart;