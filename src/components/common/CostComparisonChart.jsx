import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CostComparisonChart = ({ programs }) => {
  if (!programs || programs.length === 0) return null;

  // Prepare data for Recharts
  const chartData = programs.map((program, index) => ({
    name: `#${index + 1}`,
    programName: program.program_name,
    tuition: program.tuition_usd || 0,
    living: program.university_living_cost || 0,
    total: (program.tuition_usd || 0) + (program.university_living_cost || 0)
  }));

  // Custom tooltip to show program details
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cost-tooltip">
          <p className="tooltip-title">{data.programName}</p>
          <p className="tooltip-item tuition">
            <span className="tooltip-color tuition"></span>
            Tuition: ${data.tuition.toLocaleString()}
          </p>
          <p className="tooltip-item living">
            <span className="tooltip-color living"></span>
            Living: ${data.living.toLocaleString()}
          </p>
          <p className="tooltip-total">
            Total: ${data.total.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cost-comparison">
      <div className="cost-chart">
        <div className="chart-header">
          <span className="chart-label">Annual Costs (USD)</span>
        </div>
        
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#1c1e22' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#1c1e22' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="tuition" 
                name="Program Tuition"
                fill="#016a90" 
                radius={[0, 0, 4, 4]}
              />
              <Bar 
                dataKey="living" 
                name="Living Costs"
                fill="#094358" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Program names below chart */}
        <div className="program-names">
          {programs.map((program, index) => (
            <div key={program.program_id} className="program-label">
              <p className="program-rank">#{index + 1}</p>
              <p className="program-name">{program.program_name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CostComparisonChart;
