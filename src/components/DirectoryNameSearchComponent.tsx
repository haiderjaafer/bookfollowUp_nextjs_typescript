'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
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
  const [directoryName, setDirectoryName] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchOrderNos = async () => {
      setIsLoading(true)
      try {
        //const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/getAll`)
        const res = await fetch(fetchUrl)
        const data: string[] = await res.json()
        console.log("data",data)
        setDirectoryName(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch orderNos:', err)
        setDirectoryName([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderNos()
  }, [fetchUrl])

  const filtered = useMemo(() => {
    return directoryName.filter((o) =>
      o.toLowerCase().includes(query.toLowerCase())
    )
  }, [directoryName, query])

  const handleSelect = (selected: string) => {
    onChange(selected === value ? '' : selected)
    setOpen(false)
    console.log("selected",selected)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className=" justify-between font-bold"
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
            <CommandEmpty>لا يوجد نتائج.</CommandEmpty>
            <CommandGroup>
              {filtered.map((directoryName) => (
                <CommandItem
                  key={directoryName}
                  value={directoryName}
                  onSelect={() => handleSelect(directoryName)}
                  className="justify-between"
                >
                  {directoryName}
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      value === directoryName ? 'opacity-100' : 'opacity-0'
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

