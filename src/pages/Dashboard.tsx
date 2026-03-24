import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
} from '@mui/icons-material';
import { BalanceService } from '../services/balanceService';
import { DashboardData } from '../types';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalIncomings: 0,
    totalOutgoings: 0,
    totalBalance: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await BalanceService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              bgcolor: `${color}.light`,
              borderRadius: 1,
              p: 1,
              mr: 2,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" color={color}>
          {formatCurrency(value)}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visão geral das finanças da igreja
        </Typography>
      </Box>

      {loading ? (
        <Typography>Carregando...</Typography>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Entradas"
                value={dashboardData.totalIncomings}
                icon={<TrendingUp sx={{ color: 'success.main' }} />}
                color="success.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Saídas"
                value={dashboardData.totalOutgoings}
                icon={<TrendingDown sx={{ color: 'error.main' }} />}
                color="error.main"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Saldo Atual"
                value={dashboardData.totalBalance}
                icon={<AccountBalance sx={{ color: 'primary.main' }} />}
                color="primary.main"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Resumo Mensal
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Entradas do Mês:</Typography>
                    <Typography color="success.main" fontWeight="bold">
                      {formatCurrency(dashboardData.totalIncomings)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>Saídas do Mês:</Typography>
                    <Typography color="error.main" fontWeight="bold">
                      {formatCurrency(dashboardData.totalOutgoings)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography fontWeight="bold">Saldo do Mês:</Typography>
                    <Typography
                      color={dashboardData.totalBalance >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {formatCurrency(dashboardData.totalBalance)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Informações Gerais
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Este dashboard apresenta uma visão geral das finanças da igreja no mês corrente.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Use o menu lateral para acessar as diferentes funcionalidades do sistema.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Para adicionar novas entradas ou saídas, acesse as respectivas páginas no menu.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
}
