import React, { FC, useEffect, useState } from 'react';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';

import { Trades } from '../../@types/trades';

type tradesHistoryProps = unknown;

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
}

const columns: readonly Column[] = [
  {
    id: 'inPosition',
    label: 'In position',
    minWidth: 50,
    align: 'center',
    format: (value: boolean) => (value ? 'Yes' : 'No'),
  },
  { id: 'price', label: 'Price', minWidth: 50, align: 'center' },
  {
    id: 'profit',
    label: 'Profit',
    minWidth: 50,
    align: 'center',
    // format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'takePrice',
    label: 'Take price',
    // minWidth: 170,
    align: 'center',
    // format: (value: number) => value.toFixed(2),
  },
  {
    id: 'stopPrice',
    label: 'Stop price',
    // minWidth: 170,
    align: 'center',
    // format: (value: number) => value.toFixed(2),
  },
  {
    id: 'type',
    label: 'Type',
    // minWidth: 170,
    align: 'center',
    // format: (value: number) => value.toFixed(2),
  },
  {
    id: 'inAt',
    label: 'In at',
    // minWidth: 170,
    align: 'center',
    // format: (value: number) => value.toFixed(2),
  },
  {
    id: 'outAt',
    label: 'Out at',
    // minWidth: 170,
    align: 'center',
    // format: (value: number) => value.toFixed(2),
  },
  {
    id: 'createdAt',
    label: 'Created at',
    // minWidth: 170,
    align: 'center',
    // format: (value: number) => value.toFixed(2),
  },
  {
    id: 'updatedAt',
    label: 'Updated at',
    // minWidth: 170,
    align: 'center',
    // format: (value: number) => value.toFixed(2),
  },
];

const TradesHistoryComponent: FC<tradesHistoryProps> = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tradesHistory, setTradesHistory] = useState<Trades[]>([]);

  useEffect(() => {
    getTradesHistory();
  }, []);

  const getTradesHistory = async () => {
    const { data } = await axios.get('trades/history');
    setTradesHistory(data);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tradesHistory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((trade) => (
              <TableRow hover role="checkbox" tabIndex={-1} key={trade.inAt}>
                {columns.map((column) => {
                  const value = trade[column.id];
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {column.format ? column.format(value) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={tradesHistory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TradesHistoryComponent;
