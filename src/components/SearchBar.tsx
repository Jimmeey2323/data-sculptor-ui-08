
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ProcessedData } from '@/types/data';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchBarProps {
  onSearch: (query: string) => void;
  data: ProcessedData[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, data }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{text: string, type: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Extract unique values for suggestions
  useEffect(() => {
    if (query && query.length >= 2) {
      const uniqueClasses = new Set(data.map(item => item.cleanedClass).filter(Boolean));
      const uniqueTeachers = new Set(data.map(item => item.teacherName).filter(Boolean));
      const uniqueLocations = new Set(data.map(item => item.location).filter(Boolean));
      
      const filteredSuggestions = [
        ...Array.from(uniqueClasses).map(text => ({ text, type: 'Class' })),
        ...Array.from(uniqueTeachers).map(text => ({ text, type: 'Teacher' })),
        ...Array.from(uniqueLocations).map(text => ({ text, type: 'Location' }))
      ]
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 6); // Limit to 6 suggestions
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, data]);
  
  const handleSearch = () => {
    onSearch(query);
    setShowSuggestions(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };
  
  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by class, teacher, location..."
          className="pl-9 pr-4 w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {query && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => {
              setQuery('');
              onSearch('');
            }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          <ul className="py-1 px-2 divide-y divide-gray-100 dark:divide-gray-700">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index} 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md flex items-center justify-between"
                onClick={() => selectSuggestion(suggestion.text)}
              >
                <span>{suggestion.text}</span>
                <Badge variant="outline" className="text-xs">{suggestion.type}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
