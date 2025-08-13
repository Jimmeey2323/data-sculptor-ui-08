
import React, { useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatIndianCurrency } from '@/components/MetricsPanel';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ClassComparisonViewProps {
  data: ProcessedData[];
}

const ClassComparisonView: React.FC<ClassComparisonViewProps> = ({ data }) => {
  const classData = useMemo(() => {
    const classMap = new Map<string, any>();
    
    // Group data by class type
    data.forEach(item => {
      const classType = item.cleanedClass;
      if (!classMap.has(classType)) {
        classMap.set(classType, {
          classType,
          totalClasses: 0,
          totalCheckins: 0,
          totalRevenue: 0,
          totalCancellations: 0,
          locations: new Set(),
          trainers: new Set()
        });
      }
      
      const classStats = classMap.get(classType);
      classStats.totalClasses += item.totalOccurrences;
      classStats.totalCheckins += item.totalCheckins;
      classStats.totalRevenue += Number(item.totalRevenue);
      classStats.totalCancellations += item.totalCancelled;
      classStats.locations.add(item.location);
      classStats.trainers.add(item.teacherName);
    });
    
    // Convert data for charts
    return Array.from(classMap.values()).map(item => ({
      ...item,
      averageAttendance: item.totalClasses > 0 ? item.totalCheckins / item.totalClasses : 0,
      uniqueLocations: item.locations.size,
      uniqueTrainers: item.trainers.size,
      cancellationRate: (item.totalCancellations / (item.totalCheckins + item.totalCancellations) * 100).toFixed(1) + '%',
      locations: undefined,
      trainers: undefined
    })).sort((a, b) => b.totalCheckins - a.totalCheckins);
  }, [data]);

  const COLORS = ['#26B5C0', '#88B48A', '#FF7D6B', '#9D8DF2', '#FFB347', '#A877B1', '#71AFE5', '#77DD77'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border-[#E0E6F0] rounded-xl shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-[#323B4C] dark:text-white">Check-ins by Class Type</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={classData.slice(0, 10)} // Top 10 classes
                margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E6F0" />
                <XAxis 
                  dataKey="classType"
                  tick={{ fill: '#6B7A99' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6B7A99' }}
                />
                <Tooltip 
                  formatter={(value) => Number(value).toFixed(0)}
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    borderColor: '#E0E6F0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="totalCheckins" 
                  name="Total Check-ins" 
                  fill="#26B5C0" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="averageAttendance" 
                  name="Avg. Attendance" 
                  fill="#9D8DF2" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#E0E6F0] rounded-xl shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-[#323B4C] dark:text-white">Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={classData.slice(0, 7)} // Top 7 classes by revenue
                  dataKey="totalRevenue"
                  nameKey="classType"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.classType.split(' ').slice(-1)[0]}
                  labelLine={true}
                >
                  {classData.slice(0, 7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatIndianCurrency(Number(value))}
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    borderColor: '#E0E6F0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {classData.slice(0, 4).map((classItem, index) => (
          <Card key={index} className="border-[#E0E6F0] rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {classItem.classType}
                  </div>
                  <div className="text-2xl font-semibold mb-1">{classItem.totalCheckins.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">{classItem.totalClasses} Classes</div>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <div className="text-primary text-xs font-medium">
                    {classItem.averageAttendance.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">avg</div>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <div className="flex justify-between">
                  <div>
                    <span className="text-muted-foreground">Revenue: </span>
                    <span className="font-medium">{formatIndianCurrency(classItem.totalRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trainers: </span>
                    <span className="font-medium">{classItem.uniqueTrainers}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClassComparisonView;
