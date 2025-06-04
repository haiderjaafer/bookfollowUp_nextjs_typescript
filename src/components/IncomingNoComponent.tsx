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

interface IncomingNoComboboxProps {
  value: string | undefined
  onChange: (value: string) => void
  fetchUrl: string
}

export default function IncomingNoCombobox({
  value,
  onChange,
  fetchUrl,
}: IncomingNoComboboxProps) {
  const [open, setOpen] = useState(false)
  const [incomingNo, setIncomingNo] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchOrderNos = async () => {
      setIsLoading(true)
      try {
        //const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/getAll`)
        const res = await fetch(fetchUrl)
        const data: string[] = await res.json()
       // console.log("data",data)
        setIncomingNo(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch orderNos:', err)
        setIncomingNo([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderNos()
  }, [fetchUrl])

  const filtered = useMemo(() => {
    return incomingNo.filter((o) =>
      o.toLowerCase().includes(query.toLowerCase())
    )
  }, [incomingNo, query])

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
          {value || 'البحث عن رقم الوارد'}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="البحث عن رقم الوارد..."
            value={query}
            onValueChange={setQuery}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>لا يوجد نتائج.</CommandEmpty>
            <CommandGroup>
              {filtered.map((incomingNo) => (
                <CommandItem
                  key={incomingNo}
                  value={incomingNo}
                  onSelect={() => handleSelect(incomingNo)}
                  className="justify-between"
                >
                  {incomingNo}
                  <Check
                    className={cn(
                      'ml-2 h-4 w-4',
                      value === incomingNo ? 'opacity-100' : 'opacity-0'
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

