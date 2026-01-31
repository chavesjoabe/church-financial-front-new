import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import { AccountBalance } from '@mui/icons-material';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: 'Lançamentos',
      description: 'Registre e gerencie entradas e saídas financeiras',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
      path: '/balances',
      color: '#4caf50',
      allowedForAll: true,
    },
    {
      title: 'Importaçao de Extrato bancário',
      description: 'Registre lançamentos à partir da importação do extrato bancário no formato OFX',
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      path: '/balances',
      color: '#f4672c',
      allowedForAll: false,
    },
    {
      title: 'Dashboard',
      description: 'Visualize estatísticas e gráficos financeiros',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      path: '/dashboard',
      color: '#2196f3',
      allowedForAll: false,
    },
    {
      title: 'Impostos',
      description: 'Gerencie os impostos e obrigações fiscais',
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      path: '/taxes',
      color: '#ff9800',
      allowedForAll: false,
    },
    {
      title: 'Relatórios',
      description: 'Gere relatórios detalhados e exporte dados',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: '/reports',
      color: '#9c27b0',
      allowedForAll: false,
    },
    {
      title: 'Usuários',
      description: 'Gerencie usuários e permissões do sistema',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/users',
      color: '#f44336',
      allowedForAll: false,
    },
  ];

  const availableFeatures = user?.isAdmin
    ? features
    : features.filter(f => f.allowedForAll);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h3" gutterBottom>
          Bem-vindo, {user?.name}!
        </Typography>
        <Typography variant="h6">
          Sistema de Gestão Financeira da Igreja
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
          {user?.isAdmin
            ? 'Você tem acesso completo a todas as funcionalidades do sistema.'
            : 'Você tem acesso à funcionalidade de lançamentos financeiros.'}
        </Typography>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Funcionalidades Disponíveis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Selecione uma das opções abaixo para começar
        </Typography>

        <Grid container spacing={3}>
          {availableFeatures.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: feature.color,
                      color: 'white',
                      margin: '0 auto 16px',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(feature.path)}
                    sx={{
                      bgcolor: feature.color,
                      '&:hover': {
                        bgcolor: feature.color,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Acessar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {!user?.isAdmin && (
        <Paper
          sx={{
            p: 3,
            mt: 4,
            bgcolor: 'info.light',
            color: 'info.contrastText',
          }}
        >
          <Typography variant="h6" gutterBottom>
            ℹ️ Informação
          </Typography>
          <Typography variant="body2">
            Para acessar o Dashboard, Impostos, Relatórios e Gerenciamento de Usuários, entre em contato com um administrador do sistema.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
