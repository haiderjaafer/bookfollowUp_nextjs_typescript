'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DirectoryNameComboboxProps {
  value: string | undefined
  onChange: (value: string) => void
  fetchUrl: string
}

export default function DirectoryNameCombobox({
  value,
  onChange,
  fetchUrl,
}: DirectoryNameComboboxProps) {
  const [open, setOpen] = useState(false)
  const [directoryNames, setDirectoryNames] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400)

    return () => clearTimeout(handler)
  }, [query])

  // Fetch data from API when debounced query changes
  useEffect(() => {
    const controller = new AbortController()

    const fetchDirectoryNames = async () => {
      if (!debouncedQuery) {
        setDirectoryNames([])
        return
      }

      setIsLoading(true)
      try {
        const res = await fetch(
          `${fetchUrl}?search=${encodeURIComponent(debouncedQuery)}`,
          { signal: controller.signal }
        )
        const data: string[] = await res.json()
        setDirectoryNames(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Failed to fetch directory names:', err)
          setDirectoryNames([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDirectoryNames()

    return () => controller.abort()
  }, [debouncedQuery, fetchUrl])

  const handleSelect = (selected: string) => {
    onChange(selected === value ? '' : selected)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between font-bold"
        >
          {value || 'البحث عن اسم الدائرة'}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="البحث عن اسم الدائرة..."
            value={query}
            onValueChange={setQuery}
            className="h-9"
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
              </div>
            )}
            <CommandEmpty>لا يوجد نتائج.</CommandEmpty>
            <CommandGroup>
              {directoryNames.map((name) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={() => handleSelect(name)}
                  className="justify-between"
                >
                  {name}
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      value === name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
