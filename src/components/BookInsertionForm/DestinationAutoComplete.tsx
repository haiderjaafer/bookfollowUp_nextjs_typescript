'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
//import { cn } from '@/lib/utils';
import { ChevronsUpDown, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DestinationAutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  fetchUrl: string;
}

export default function DestinationAutoComplete({
  value,
  onChange,
  fetchUrl,
}: DestinationAutoCompleteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [destination, setDestination] = useState<string[]>([]);

  const filtered = destination.filter((destination) =>
    destination.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(fetchUrl);
        const data = await res.json();
        if (Array.isArray(data)) {
          setDestination(data);
        }
      } catch (err) {
        console.error('Failed to load destination', err);
      }
    };
    fetchData();
  }, [fetchUrl]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
    },
    [onChange]
  );

  const handleClear = () => {
    setQuery('');
    onChange('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            dir="rtl"
            onClick={() => setOpen(true)}
            value={value}
            readOnly
            placeholder="اختر أو أدخل  جهة البريد"
            className="w-full pr-10 h-12 text-right font-sans font-extrabold shadow-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
          {value && (
            <XCircle
              onClick={handleClear}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer"
            />
          )}
          <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className=" w-[550px]  mt-1 z-50 p-0 max-h-64 overflow-y-auto shadow-xl rounded-lg font-extrabold" align="start" sideOffset={4}>
        <Command>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="اكتب للبحث أو الإضافة..."
            className="text-right font-arabic"
          />
          <CommandList className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((item, i) => (
                <CommandItem
                  key={i}
                  value={item}
                  onSelect={() => handleSelect(item)}
                  className="text-right font-arabic"
                >
                  {item}
                </CommandItem>
              ))
            ) : (
              <CommandEmpty className="text-right font-arabic px-2 py-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-right text-blue-600 hover:bg-blue-50"
                  onClick={() => handleSelect(query)}
                >
                  إضافة جديد: {query}
                </Button>
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
