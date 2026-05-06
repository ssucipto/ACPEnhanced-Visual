import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import type { Milestone } from '../lib/types';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

const col = createColumnHelper<Milestone>();

const columns = [
  col.accessor('id', {
    header: 'ID',
    cell: (info) => (
      <span className="font-mono text-xs font-semibold text-gray-600">{info.getValue()}</span>
    ),
  }),
  col.accessor('name', {
    header: 'Name',
    cell: (info) => <span className="text-sm text-gray-800">{info.getValue()}</span>,
  }),
  col.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  col.accessor('progress', {
    header: 'Progress',
    cell: (info) => <ProgressBar value={info.getValue()} />,
  }),
  col.accessor('tasks_completed', {
    header: 'Tasks',
    cell: (info) => (
      <span className="font-mono text-xs text-gray-600">
        {info.getValue()} / {info.row.original.tasks_total}
      </span>
    ),
  }),
  col.accessor('priority', {
    header: 'Priority',
    cell: (info) => (
      <span className="font-mono text-xs text-gray-500">{info.getValue()}</span>
    ),
  }),
  col.accessor('estimated_weeks', {
    header: 'Est. Weeks',
    enableSorting: false,
    cell: (info) => (
      <span className="font-mono text-xs text-gray-500">{info.getValue() ?? '—'}</span>
    ),
  }),
  col.accessor('started', {
    header: 'Started',
    cell: (info) => (
      <span className="font-mono text-xs text-gray-500">{info.getValue() ?? '—'}</span>
    ),
  }),
  col.accessor('completed', {
    header: 'Completed',
    cell: (info) => (
      <span className="font-mono text-xs text-gray-500">{info.getValue() ?? '—'}</span>
    ),
  }),
];

interface Props {
  milestones: Milestone[];
}

export function MilestoneTable({ milestones }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: milestones,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-left">
        <thead className="bg-gray-50 sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide select-none whitespace-nowrap border-b border-gray-200"
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  <span className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="text-gray-400">
                        {header.column.getIsSorted() === 'asc'
                          ? '↑'
                          : header.column.getIsSorted() === 'desc'
                            ? '↓'
                            : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, i) => (
            <tr
              key={row.id}
              className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer transition-colors`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-1.5 border-b border-gray-100">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
