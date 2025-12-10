import React from 'react';
import { EnvTool, ToolType, Language } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import Scanner from './Scanner';

interface DashboardProps {
  tools: EnvTool[];
  language: Language;
  onImport: (newTools: EnvTool[]) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const Dashboard: React.FC<DashboardProps> = ({ tools, language, onImport }) => {
  // Calculate stats
  const distribution = [
    { name: 'Java', value: tools.filter(t => t.type === ToolType.JAVA).length },
    { name: 'Python', value: tools.filter(t => t.type === ToolType.PYTHON).length },
    { name: 'Go', value: tools.filter(t => t.type === ToolType.GO).length },
    { name: 'Node', value: tools.filter(t => t.type === ToolType.NODE).length },
  ].filter(d => d.value > 0);

  const totalTools = tools.length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Total Environments</p>
          <p className="text-4xl font-bold text-white mt-2">{totalTools}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Java Versions</p>
          <p className="text-4xl font-bold text-orange-400 mt-2">{tools.filter(t => t.type === ToolType.JAVA).length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Python Versions</p>
          <p className="text-4xl font-bold text-blue-400 mt-2">{tools.filter(t => t.type === ToolType.PYTHON).length}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <p className="text-slate-400 text-sm font-medium">Node.js Versions</p>
          <p className="text-4xl font-bold text-green-400 mt-2">{tools.filter(t => t.type === ToolType.NODE).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[450px]">
        {/* Chart */}
        <div className="lg:col-span-1 bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Distribution</h3>
          {distribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-500">No data</div>
          )}
        </div>

        {/* Embedded Scanner */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <Scanner onImport={onImport} embedded={true} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;