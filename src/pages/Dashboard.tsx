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
  CalendarMonth,
} from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { BalanceService } from '../services/balanceService';
import { DashboardStats } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthIncome: 0,
    monthExpense: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await BalanceService.getStats();
      setStats(data);
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
    <Layout>
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
                  value={stats.totalIncome}
                  icon={<TrendingUp sx={{ color: 'success.main' }} />}
                  color="success.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Saídas"
                  value={stats.totalExpense}
                  icon={<TrendingDown sx={{ color: 'error.main' }} />}
                  color="error.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Saldo Atual"
                  value={stats.balance}
                  icon={<AccountBalance sx={{ color: 'primary.main' }} />}
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Entradas do Mês"
                  value={stats.monthIncome}
                  icon={<CalendarMonth sx={{ color: 'info.main' }} />}
                  color="info.main"
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
                        {formatCurrency(stats.monthIncome)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Saídas do Mês:</Typography>
                      <Typography color="error.main" fontWeight="bold">
                        {formatCurrency(stats.monthExpense)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: 1, borderColor: 'divider' }}>
                      <Typography fontWeight="bold">Saldo do Mês:</Typography>
                      <Typography
                        color={stats.monthIncome - stats.monthExpense >= 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {formatCurrency(stats.monthIncome - stats.monthExpense)}
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
                      Este dashboard apresenta uma visão geral das finanças da igreja.
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
    </Layout>
  );
}