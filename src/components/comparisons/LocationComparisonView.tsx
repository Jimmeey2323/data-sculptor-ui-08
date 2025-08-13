
import React, { useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatIndianCurrency } from '@/components/MetricsPanel';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LocationComparisonViewProps {
  data: ProcessedData[];
}

const LocationComparisonView: React.FC<LocationComparisonViewProps> = ({ data }) => {
  const locationData = useMemo(() => {
    const locationMap = new Map<string, any>();
    
    // Group data by location
    data.forEach(item => {
      const location = item.location;
      if (!locationMap.has(location)) {
        locationMap.set(location, {
          location,
          totalClasses: 0,
          totalCheckins: 0,
          totalRevenue: 0,
          averageAttendance: 0,
          classes: new Set()
        });
      }
      
      const locationStats = locationMap.get(location);
      locationStats.totalClasses += item.totalOccurrences;
      locationStats.totalCheckins += item.totalCheckins;
      locationStats.totalRevenue += Number(item.totalRevenue);
      locationStats.classes.add(item.cleanedClass);
    });
    
    // Calculate averages and convert data for charts
    return Array.from(locationMap.values()).map(item => ({
      ...item,
      averageAttendance: item.totalClasses > 0 ? item.totalCheckins / item.totalClasses : 0,
      uniqueClasses: item.classes.size,
      classes: undefined // Don't need to pass Set to charts
    })).sort((a, b) => b.totalCheckins - a.totalCheckins);
  }, [data]);

  const COLORS = ['#26B5C0', '#88B48A', '#FF7D6B', '#9D8DF2', '#FFB347', '#A877B1', '#71AFE5', '#77DD77'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border-[#E0E6F0] rounded-xl shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-[#323B4C] dark:text-white">Check-ins by Location</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={locationData}
                margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E6F0" />
                <XAxis 
                  dataKey="location"
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
                  dataKey="totalClasses" 
                  name="Total Classes" 
                  fill="#88B48A"
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
                  data={locationData}
                  dataKey="totalRevenue"
                  nameKey="location"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.location}
                  labelLine={true}
                >
                  {locationData.map((entry, index) => (
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
        {locationData.slice(0, 4).map((location, index) => (
          <Card key={index} className="border-[#E0E6F0] rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {location.location}
                  </div>
                  <div className="text-2xl font-semibold mb-1">{location.totalCheckins.toFixed(0)}</div>
                  <div className="text-sm text-muted-foreground">{location.totalClasses} Classes</div>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <div className="text-primary text-xs font-medium">
                    {location.averageAttendance.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">avg</div>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">Revenue: </span>
                <span className="font-medium">{formatIndianCurrency(location.totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LocationComparisonView;
