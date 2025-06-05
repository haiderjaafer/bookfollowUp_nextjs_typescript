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
  //setTimeout(function, milliseconds)  definition

  useEffect(() => {                       // useEffect will run whenever query variable changed 
    const handler = setTimeout(() => {    // The setTimeout() method calls a function after a number of milliseconds here 400 so 1 second = 1000 milliseconds.so The setTimeout() is executed only once
      setDebouncedQuery(query)
    }, 400)

    //handler is the ID of the timeout allowing you to cancel it later 

    return () => clearTimeout(handler)    //clearTimeout() method to prevent the function from starting or cleanUp function 
  }, [query])   // each time the user types , query updates, triggering useEffect again . before the new effct runs, the cleanUp called clearing the previous tiemout

  // Fetch data from API when debounced query changes
  useEffect(() => { 
    const controller = new AbortController()  //AbortController is a built-in JavaScript API that allows you to abort ongoing operations, such as fetch requests. It provides a way to signal that a particular operation should be canceled.



    console.log("value..."+ value);

    console.log("query..."+ query);  // what you writing in search box

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

        console.log("debouncedQuery " + debouncedQuery)

       // console.log("DirectoryNames data " + data)
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

    return () => controller.abort()  //You can call the abort() method on the controller to cancel the fetch request
  }, [debouncedQuery, fetchUrl])

  const handleSelect = (selected: string) => {
    onChange(selected === value ? '' : selected)
    setOpen(false)

    console.log(" value in handleSelect  " + value)   // as if previous value selected

    console.log(" selected in handleSelect  " + selected) // now value selected
    
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
