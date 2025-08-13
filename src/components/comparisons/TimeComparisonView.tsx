
import React, { useMemo } from 'react';
import { ProcessedData } from '@/types/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatIndianCurrency } from '@/components/MetricsPanel';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TimeComparisonViewProps {
  data: ProcessedData[];
}

const TimeComparisonView: React.FC<TimeComparisonViewProps> = ({ data }) => {
  const dayOfWeekData = useMemo(() => {
    const dayMap = new Map<string, any>();
    const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize all days
    daysOrder.forEach(day => {
      dayMap.set(day, {
        day,
        totalClasses: 0,
        totalCheckins: 0,
        totalRevenue: 0,
        averageAttendance: 0
      });
    });
    
    // Group data by day of week
    data.forEach(item => {
      const day = item.dayOfWeek;
      if (!dayMap.has(day)) {
        dayMap.set(day, {
          day,
          totalClasses: 0,
          totalCheckins: 0,
          totalRevenue: 0,
          averageAttendance: 0
        });
      }
      
      const dayStats = dayMap.get(day);
      dayStats.totalClasses += item.totalOccurrences;
      dayStats.totalCheckins += item.totalCheckins;
      dayStats.totalRevenue += Number(item.totalRevenue);
    });
    
    // Calculate averages
    dayMap.forEach(stats => {
      stats.averageAttendance = stats.totalClasses > 0 ? stats.totalCheckins / stats.totalClasses : 0;
    });
    
    // Sort by day of week
    return daysOrder.map(day => dayMap.get(day));
  }, [data]);

  const timeOfDayData = useMemo(() => {
    const timeMap = new Map<string, any>();
    
    // Group data by time of day (hour)
    data.forEach(item => {
      let timeSlot = '';
      
      // Extract hour from classTime (format "11:30 AM")
      if (item.classTime) {
        const timeParts = item.classTime.split(' ');
        const hourMin = timeParts[0].split(':');
        let hour = parseInt(hourMin[0]);
        const ampm = timeParts[1];
        
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        
        // Group by 2-hour slots
        const slotStart = Math.floor(hour / 2) * 2;
        const slotEnd = slotStart + 2;
        const formattedStart = slotStart % 12 === 0 ? 12 : slotStart % 12;
        const formattedEnd = slotEnd % 12 === 0 ? 12 : slotEnd % 12;
        const startAmPm = slotStart < 12 ? 'AM' : 'PM';
        const endAmPm = slotEnd < 12 ? 'AM' : 'PM';
        
        timeSlot = `${formattedStart}${startAmPm}-${formattedEnd}${endAmPm}`;
      } else {
        timeSlot = 'Unknown';
      }
      
      if (!timeMap.has(timeSlot)) {
        timeMap.set(timeSlot, {
          timeSlot,
          totalClasses: 0,
          totalCheckins: 0,
          totalRevenue: 0,
          averageAttendance: 0
        });
      }
      
      const timeStats = timeMap.get(timeSlot);
      timeStats.totalClasses += item.totalOccurrences;
      timeStats.totalCheckins += item.totalCheckins;
      timeStats.totalRevenue += Number(item.totalRevenue);
    });
    
    // Calculate averages
    timeMap.forEach(stats => {
      stats.averageAttendance = stats.totalClasses > 0 ? stats.totalCheckins / stats.totalClasses : 0;
    });
    
    // Convert to array and sort by time slot
    return Array.from(timeMap.values()).sort((a, b) => {
      const hourA = a.timeSlot.includes('AM') ? parseInt(a.timeSlot) : parseInt(a.timeSlot) + 12;
      const hourB = b.timeSlot.includes('AM') ? parseInt(b.timeSlot) : parseInt(b.timeSlot) + 12;
      return hourA - hourB;
    });
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#E0E6F0] rounded-xl shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-[#323B4C] dark:text-white">Check-ins by Day of Week</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={dayOfWeekData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E6F0" />
                <XAxis dataKey="day" tick={{ fill: '#6B7A99' }} />
                <YAxis tick={{ fill: '#6B7A99' }} />
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
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#E0E6F0] rounded-xl shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-[#323B4C] dark:text-white">Average Attendance by Day</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={dayOfWeekData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E6F0" />
                <XAxis dataKey="day" tick={{ fill: '#6B7A99' }} />
                <YAxis tick={{ fill: '#6B7A99' }} />
                <Tooltip 
                  formatter={(value) => Number(value).toFixed(1)}
                  contentStyle={{ 
                    backgroundColor: '#FFF', 
                    borderColor: '#E0E6F0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="averageAttendance" 
                  name="Avg. Attendance" 
                  stroke="#9D8DF2" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#E0E6F0] rounded-xl shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-[#323B4C] dark:text-white">Performance by Time of Day</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={timeOfDayData}
              margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E6F0" />
              <XAxis 
                dataKey="timeSlot"
                tick={{ fill: '#6B7A99' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis yAxisId="left" tick={{ fill: '#6B7A99' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6B7A99' }} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'totalRevenue') return formatIndianCurrency(Number(value));
                  return Number(value).toFixed(1);
                }}
                contentStyle={{ 
                  backgroundColor: '#FFF', 
                  borderColor: '#E0E6F0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="averageAttendance" 
                name="Avg. Attendance" 
                fill="#9D8DF2" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="right"
                dataKey="totalRevenue" 
                name="Revenue" 
                fill="#88B48A" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-[#E0E6F0] rounded-xl shadow-sm overflow-hidden bg-gradient-to-br from-[#F8F9FC] to-[#F0F4FF] dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-[#1E2F4D] dark:text-white" />
              <h3 className="font-semibold text-[#1E2F4D] dark:text-white">Peak Day</h3>
            </div>
            <div className="text-2xl font-bold text-[#1E2F4D] dark:text-white">
              {dayOfWeekData.sort((a, b) => b.totalCheckins - a.totalCheckins)[0]?.day}
            </div>
            <div className="text-sm text-[#6B7A99] dark:text-gray-400 mt-1">
              {dayOfWeekData.sort((a, b) => b.totalCheckins - a.totalCheckins)[0]?.totalCheckins.toFixed(0)} check-ins
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E0E6F0] rounded-xl shadow-sm overflow-hidden bg-gradient-to-br from-[#F8F9FC] to-[#F0F4FF] dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-[#1E2F4D] dark:text-white" />
              <h3 className="font-semibold text-[#1E2F4D] dark:text-white">Peak Time</h3>
            </div>
            <div className="text-2xl font-bold text-[#1E2F4D] dark:text-white">
              {timeOfDayData.sort((a, b) => b.totalCheckins - a.totalCheckins)[0]?.timeSlot}
            </div>
            <div className="text-sm text-[#6B7A99] dark:text-gray-400 mt-1">
              {timeOfDayData.sort((a, b) => b.totalCheckins - a.totalCheckins)[0]?.totalCheckins.toFixed(0)} check-ins
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-[#E0E6F0] rounded-xl shadow-sm overflow-hidden bg-gradient-to-br from-[#F8F9FC] to-[#F0F4FF] dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-[#1E2F4D] dark:text-white" />
              <h3 className="font-semibold text-[#1E2F4D] dark:text-white">Most Profitable Time</h3>
            </div>
            <div className="text-2xl font-bold text-[#1E2F4D] dark:text-white">
              {timeOfDayData.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.timeSlot}
            </div>
            <div className="text-sm text-[#6B7A99] dark:text-gray-400 mt-1">
              {formatIndianCurrency(timeOfDayData.sort((a, b) => b.totalRevenue - a.totalRevenue)[0]?.totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeComparisonView;
