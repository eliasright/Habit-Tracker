import React from 'react';
import Select from 'react-select';
import moment from 'moment-timezone';

interface TimezoneOption {
  value: string;
  label: string;
  searchTerms: string;
}

interface TimezoneSelectorProps {
  value: string;
  onChange: (timezone: string) => void;
  className?: string;
}

// Create comprehensive timezone options with city and country information
const createTimezoneOptions = (): TimezoneOption[] => {
  const timezones = moment.tz.names();
  
  const cityMappings: Record<string, string> = {
    'Asia/Bangkok': 'Bangkok, Thailand',
    'Asia/Phuket': 'Phuket, Thailand', 
    'Asia/Hong_Kong': 'Hong Kong',
    'Asia/Singapore': 'Singapore',
    'Asia/Tokyo': 'Tokyo, Japan',
    'Asia/Seoul': 'Seoul, South Korea',
    'Asia/Shanghai': 'Shanghai, China',
    'Asia/Dubai': 'Dubai, UAE',
    'Asia/Kolkata': 'Mumbai, India',
    'Asia/Manila': 'Manila, Philippines',
    'Europe/London': 'London, UK',
    'Europe/Paris': 'Paris, France',
    'Europe/Berlin': 'Berlin, Germany',
    'Europe/Rome': 'Rome, Italy',
    'Europe/Madrid': 'Madrid, Spain',
    'Europe/Amsterdam': 'Amsterdam, Netherlands',
    'Europe/Stockholm': 'Stockholm, Sweden',
    'Europe/Zurich': 'Zurich, Switzerland',
    'America/New_York': 'New York, USA',
    'America/Los_Angeles': 'Los Angeles, USA',
    'America/Chicago': 'Chicago, USA',
    'America/Denver': 'Denver, USA',
    'America/Toronto': 'Toronto, Canada',
    'America/Vancouver': 'Vancouver, Canada',
    'America/Mexico_City': 'Mexico City, Mexico',
    'America/Sao_Paulo': 'São Paulo, Brazil',
    'America/Buenos_Aires': 'Buenos Aires, Argentina',
    'Australia/Sydney': 'Sydney, Australia',
    'Australia/Melbourne': 'Melbourne, Australia',
    'Australia/Perth': 'Perth, Australia',
    'Pacific/Auckland': 'Auckland, New Zealand',
    'Africa/Cairo': 'Cairo, Egypt',
    'Africa/Johannesburg': 'Johannesburg, South Africa',
    'Africa/Lagos': 'Lagos, Nigeria'
  };

  return timezones.map(tz => {
    const cityName = cityMappings[tz];
    if (cityName) {
      return {
        value: tz,
        label: `${cityName} (${tz})`,
        searchTerms: `${cityName} ${tz}`.toLowerCase()
      };
    }
    
    // Generate readable label from timezone
    const parts = tz.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    const region = parts[0];
    
    return {
      value: tz,
      label: `${city}, ${region} (${tz})`,
      searchTerms: `${city} ${region} ${tz}`.toLowerCase()
    };
  }).sort((a, b) => a.label.localeCompare(b.label));
};

const timezoneOptions = createTimezoneOptions();

// Custom filter function for better search
const filterOption = (option: any, inputValue: string) => {
  if (!inputValue) return true;
  
  const searchTerm = inputValue.toLowerCase();
  return option.data.searchTerms.includes(searchTerm) ||
         option.data.label.toLowerCase().includes(searchTerm);
};

// Custom styles for react-select to match our theme
const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: 'var(--bg-primary)',
    borderColor: state.isFocused ? 'var(--accent)' : 'var(--border-color)',
    color: 'var(--text-primary)',
    boxShadow: state.isFocused ? '0 0 0 2px var(--accent)' : 'none',
    '&:hover': {
      borderColor: 'var(--accent)'
    }
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? 'var(--accent)' 
      : state.isFocused 
      ? 'var(--bg-secondary)' 
      : 'transparent',
    color: state.isSelected ? 'white' : 'var(--text-primary)',
    '&:hover': {
      backgroundColor: state.isSelected ? 'var(--accent)' : 'var(--bg-secondary)'
    }
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: 'var(--text-primary)'
  }),
  input: (provided: any) => ({
    ...provided,
    color: 'var(--text-primary)'
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: 'var(--text-secondary)',
    opacity: 0.7
  })
};

export default function TimezoneSelector({ value, onChange, className = '' }: TimezoneSelectorProps) {
  const selectedOption = timezoneOptions.find(option => option.value === value);

  return (
    <Select
      className={className}
      value={selectedOption}
      onChange={(option) => onChange(option?.value || '')}
      options={timezoneOptions}
      filterOption={filterOption}
      placeholder="Search for your city or timezone..."
      isSearchable
      isClearable
      menuPosition="fixed"
      menuPlacement="auto"
      styles={customStyles}
      noOptionsMessage={({ inputValue }) => 
        inputValue ? `No timezone found for "${inputValue}"` : 'Type to search for your timezone'
      }
    />
  );
}