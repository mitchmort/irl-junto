"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ColumnsIcon,
  FilterIcon,
  MoreHorizontal,
  PlusCircle,
  Calendar,
  MapPin,
  Users,
  Trophy
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { UserEvent } from "@/hooks/use-user-events";

export type Event = UserEvent;

// Helper function to get sport icon
const getSportIcon = (sportType: string) => {
  const sportIcons: { [key: string]: string } = {
    Basketball: "🏀",
    Tennis: "🎾",
    Pickleball: "🏓",
    Volleyball: "🏐",
    Soccer: "⚽",
    Climbing: "🧗"
  };
  return sportIcons[sportType] || "🏃";
};

// Helper function to format date and time
const formatDateTime = (date: string, time: string) => {
  const eventDate = new Date(`${date}T${time}`);
  return eventDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

export const columns: ColumnDef<Event>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Event Name
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link 
        href={`/dashboard/events/${row.original.id}`} 
        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
      >
        <figure className="flex items-center justify-center w-12 h-12 rounded-lg border bg-muted">
          <span className="text-lg">{getSportIcon(row.original.sport)}</span>
        </figure>
        <div className="font-medium">{row.getValue("title")}</div>
      </Link>
    )
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date & Time
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="size-4 text-muted-foreground" />
        <span>{formatDateTime(row.original.date, row.original.time)}</span>
      </div>
    ),
    filterFn: (row, columnId, value: { filter: string; date: Date }) => {
      if (!value || value.filter === "all") return true;
      const eventDate = new Date(row.getValue(columnId) as string);
      const now = new Date();
      
      switch (value.filter) {
        case "today":
          return eventDate.toDateString() === now.toDateString();
        case "this-week":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        case "this-month":
          return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
        case "next-30-days":
          const future30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return eventDate >= now && eventDate <= future30Days;
        default:
          return true;
      }
    }
  },
  {
    accessorKey: "sport",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Sport Type
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Trophy className="size-4 text-muted-foreground" />
        <span>{row.getValue("sport")}</span>
      </div>
    ),
    filterFn: (row, columnId, value: string[]) => {
      if (!value || value.length === 0) return true;
      return value.includes((row.getValue(columnId) as string).toLowerCase());
    }
  },
  {
    accessorKey: "participant_count",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Participants
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Users className="size-4 text-muted-foreground" />
        <span>{row.original.participant_count}/{row.original.max_participants}</span>
      </div>
    )
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      // Parse location JSON to get venue name
      let venueName = '';
      try {
        const location = JSON.parse(row.original.location);
        venueName = location.name || location.address || 'Unknown Location';
      } catch {
        venueName = row.original.location || 'Unknown Location';
      }
      
      return (
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" />
          <span className="truncate max-w-[150px]" title={venueName}>
            {venueName}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: "user_role",
    header: "My Role",
    cell: ({ row }) => {
      const role = row.original.user_role;
      if (!role) return <span className="text-muted-foreground">-</span>;
      
      return (
        <Badge variant={role === "organizer" ? "default" : "secondary"}>
          {role === "organizer" ? "Organizer" : "Participant"}
        </Badge>
      );
    }
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          className="-ml-3"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status
          <ArrowUpDown className="size-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const event = row.original;
      let status: string;
      
      if (event.status === 'cancelled') {
        status = 'cancelled';
      } else if (new Date(event.date) < new Date()) {
        status = 'completed';
      } else if (event.participant_count >= event.max_participants) {
        status = 'full';
      } else {
        status = 'upcoming';
      }

      const statusMap = {
        upcoming: "default",
        full: "warning",
        completed: "secondary",
        cancelled: "destructive"
      } as const;

      const statusClass = statusMap[status as keyof typeof statusMap] ?? "default";

      return (
        <div>
          <Badge variant={statusClass} className="capitalize">
            {status}
          </Badge>
        </div>
      );
    },
    filterFn: (row, columnId, value: string[]) => {
      if (!value || value.length === 0) return true;
      const event = row.original;
      let status: string;
      
      if (event.status === 'cancelled') {
        status = 'cancelled';
      } else if (new Date(event.date) < new Date()) {
        status = 'completed';
      } else if (event.participant_count >= event.max_participants) {
        status = 'full';
      } else {
        status = 'upcoming';
      }
      
      return value.includes(status);
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/events/${row.original.id}`}>
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Event</DropdownMenuItem>
            <DropdownMenuItem>Share Link</DropdownMenuItem>
            <DropdownMenuItem>Cancel Event</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

// Mobile Event Card Component
const MobileEventCard = ({ event }: { event: Event }) => {
  // Parse location JSON to get venue name
  let venueName = '';
  try {
    const location = JSON.parse(event.location);
    venueName = location.name || location.address || 'Unknown Location';
  } catch {
    venueName = event.location || 'Unknown Location';
  }

  // Calculate status
  let status: string;
  if (event.status === 'cancelled') {
    status = 'cancelled';
  } else if (new Date(event.date) < new Date()) {
    status = 'completed';
  } else if (event.participant_count >= event.max_participants) {
    status = 'full';
  } else {
    status = 'upcoming';
  }

  return (
    <div className="bg-white rounded-lg border p-4 space-y-3" role="article" aria-label={`Event: ${event.title}`}>
      {/* Event Name with Sport Icon - Clickable */}
      <Link 
        href={`/dashboard/events/${event.id}`}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        aria-label={`View details for ${event.title}`}
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg border bg-muted" aria-hidden="true">
          <span className="text-lg">{getSportIcon(event.sport)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{event.title}</h3>
        </div>
      </Link>

      {/* Date & Time */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="size-4" />
        <span>{formatDateTime(event.date, event.time)}</span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" />
        <span className="truncate" title={venueName}>
          {venueName}
        </span>
      </div>

      {/* Bottom Row: Participants, Role, Status, Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Participants */}
          <div className="flex items-center gap-1 text-sm">
            <Users className="size-4 text-muted-foreground" />
            <span>{event.participant_count}/{event.max_participants}</span>
          </div>

          {/* Role Badge */}
          {event.user_role && (
            <Badge variant={event.user_role === "organizer" ? "default" : "secondary"} className="text-xs">
              {event.user_role === "organizer" ? "Organizer" : "Participant"}
            </Badge>
          )}

          {/* Status Badge */}
          <Badge 
            variant={
              status === "upcoming" ? "default" :
              status === "full" ? "warning" :
              status === "completed" ? "secondary" : "destructive"
            } 
            className="text-xs capitalize"
          >
            {status}
          </Badge>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/events/${event.id}`}>
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Event</DropdownMenuItem>
            <DropdownMenuItem>Share Link</DropdownMenuItem>
            <DropdownMenuItem>Cancel Event</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default function EventList({ data }: { data: Event[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  const statuses = [
    {
      value: "upcoming",
      label: "Upcoming"
    },
    {
      value: "full",
      label: "Full"
    },
    {
      value: "completed",
      label: "Completed"
    },
    {
      value: "cancelled",
      label: "Cancelled"
    }
  ];

  const sportTypes = [
    {
      value: "basketball",
      label: "Basketball"
    },
    {
      value: "tennis",
      label: "Tennis"
    },
    {
      value: "pickleball",
      label: "Pickleball"
    },
    {
      value: "volleyball",
      label: "Volleyball"
    },
    {
      value: "soccer",
      label: "Soccer"
    },
    {
      value: "climbing",
      label: "Climbing"
    }
  ];

  const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
  const [sportTypeFilter, setSportTypeFilter] = React.useState<string[]>([]);
  const [dateFilter, setDateFilter] = React.useState<string>("all");

  // Apply filters to table
  React.useEffect(() => {
    const filters: any[] = [];
    
    if (statusFilter.length > 0) {
      filters.push({
        id: "status",
        value: statusFilter
      });
    }
    
    if (sportTypeFilter.length > 0) {
      filters.push({
        id: "sport",
        value: sportTypeFilter
      });
    }
    
    if (dateFilter !== "all") {
      const now = new Date();
      let filterDate: Date;
      
      switch (dateFilter) {
        case "today":
          filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "this-week":
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          filterDate = startOfWeek;
          break;
        case "this-month":
          filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "next-30-days":
          filterDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          filterDate = new Date(0);
      }
      
      filters.push({
        id: "date",
        value: { filter: dateFilter, date: filterDate }
      });
    }
    
    setColumnFilters(filters);
  }, [statusFilter, sportTypeFilter, dateFilter]);

  const handleStatusFilterChange = (statusValue: string, checked: boolean) => {
    setStatusFilter(prev => 
      checked 
        ? [...prev, statusValue]
        : prev.filter(s => s !== statusValue)
    );
  };

  const handleSportTypeFilterChange = (sportValue: string, checked: boolean) => {
    setSportTypeFilter(prev => 
      checked 
        ? [...prev, sportValue]
        : prev.filter(s => s !== sportValue)
    );
  };

  const Filters = () => {
    return (
      <>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <PlusCircle />
              Status
              {statusFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {statusFilter.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0">
            <Command>
              <CommandInput placeholder="Status" className="h-9" />
              <CommandList>
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  {statuses.map((status) => (
                    <CommandItem
                      key={status.value}
                      value={status.value}
                      onSelect={(currentValue) => {
                        const isChecked = statusFilter.includes(currentValue);
                        handleStatusFilterChange(currentValue, !isChecked);
                      }}>
                      <div className="flex items-center space-x-3 py-1">
                        <Checkbox 
                          id={status.value}
                          checked={statusFilter.includes(status.value)}
                          onChange={() => {}} // Handled by onSelect
                        />
                        <label
                          htmlFor={status.value}
                          className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {status.label}
                        </label>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <PlusCircle />
              Sport Type
              {sportTypeFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                  {sportTypeFilter.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0">
            <Command>
              <CommandInput placeholder="Sport Type" className="h-9" />
              <CommandList>
                <CommandEmpty>No sport type found.</CommandEmpty>
                <CommandGroup>
                  {sportTypes.map((sportType) => (
                    <CommandItem 
                      key={sportType.value} 
                      value={sportType.value}
                      onSelect={(currentValue) => {
                        const isChecked = sportTypeFilter.includes(currentValue.toLowerCase());
                        handleSportTypeFilterChange(currentValue.toLowerCase(), !isChecked);
                      }}>
                      <div className="flex items-center space-x-3 py-1">
                        <Checkbox 
                          id={sportType.value}
                          checked={sportTypeFilter.includes(sportType.value)}
                          onChange={() => {}} // Handled by onSelect
                        />
                        <label
                          htmlFor={sportType.value}
                          className="leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {sportType.label}
                        </label>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-52 lg:w-auto">
            <span className="text-muted-foreground text-sm">Date:</span>
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="next-30-days">Next 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </>
    );
  };

  return (
    <Card>
      <CardHeader>
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search events..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
              className="max-w-sm"
            />
            <Filters />
          </div>
          <div className="ms-auto flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <span className="hidden lg:inline">Columns</span> <ColumnsIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search events..."
              value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
              className="flex-1"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <FilterIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4">
                <div className="space-y-4">
                  <h4 className="font-semibold">Filters</h4>
                  <div className="space-y-3">
                    <Filters />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow 
                        key={row.id} 
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No events found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <div className="text-muted-foreground flex-1 text-sm">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}>
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {table.getRowModel().rows?.length ? (
              <>
                <div className="space-y-3">
                  {table.getRowModel().rows.map((row) => (
                    <MobileEventCard key={row.id} event={row.original} />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    {table.getFilteredRowModel().rows.length} event(s)
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}