import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { BalanceService } from '../services/balanceService';
import { Balance } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function PendingBalances() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadPendingBalances();
  }, []);

  const loadPendingBalances = async () => {
    setLoading(true);
    try {
      const data = await BalanceService.getPending();
      setBalances(data);
    } catch (error) {
      console.error('Error loading pending balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (window.confirm('Deseja aprovar este lançamento?')) {
      try {
        await BalanceService.approve(id);
        await loadPendingBalances();
      } catch (error) {
        alert('Erro ao aprovar lançamento');
      }
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm('Deseja rejeitar este lançamento?')) {
      try {
        await BalanceService.reject(id);
        await loadPendingBalances();
      } catch (error) {
        alert('Erro ao rejeitar lançamento');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const canApprove = (balance: Balance) => {
    // User cannot approve their own balance
    return user?.document !== balance.responsible;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          Lançamentos Pendentes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          Aprove ou rejeite lançamentos aguardando revisão
        </Typography>
      </Box>

      {loading ? (
        <Typography>Carregando...</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Data</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Categoria</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Criado por</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {balances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Nenhum lançamento pendente
                  </TableCell>
                </TableRow>
              ) : (
                balances.map((balance) => (
                  <TableRow key={balance.id}>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      {formatDate(balance.balanceDate)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={balance.type === 'INCOMING' ? 'Entrada' : 'Saída'}
                        color={balance.type === 'INCOMING' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {balance.description}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {balance.category}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: balance.type === 'INCOMING' ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      }}
                    >
                      {formatCurrency(balance.value)}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      {balance.responsibleName || balance.createdBy}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleApprove(balance.id)}
                          color="success"
                          disabled={!canApprove(balance)}
                          sx={{ padding: { xs: '4px', sm: '8px' } }}
                          title={canApprove(balance) ? 'Aprovar' : 'Você não pode aprovar seu próprio lançamento'}
                        >
                          <Check fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleReject(balance.id)}
                          color="error"
                          sx={{ padding: { xs: '4px', sm: '8px' } }}
                          title={canApprove(balance) ? 'Rejeitar' : 'Você não pode rejeitar seu próprio lançamento'}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
