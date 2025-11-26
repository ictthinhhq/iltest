import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Competency } from '../types';

interface CompetencyChartProps {
  data: Competency[];
}

export const CompetencyChart: React.FC<CompetencyChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[350px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid gridType="polygon" stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="name" 
            tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Năng lực"
            dataKey="score"
            stroke="#059669" // Emerald 600
            strokeWidth={3}
            fill="#10b981" // Emerald 500
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#047857', fontWeight: 600 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};