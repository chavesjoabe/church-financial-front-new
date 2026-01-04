import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
} from '@mui/material';
import { Edit, Save } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { TaxService } from '../services/taxService';
import { Tax } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Taxas() {
  const { token } = useAuth();
  const [tax, setTax] = useState<Tax | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstLeaderPercentage: '',
    secondLeaderPercentage: '',
    mainChurchPercentage: '',
    ministryPercentage: '',
    mainLeaderPercentage: '',
    transferMainLeaderPercentage: '',
    transferMainChurchPercentage: '',
  });

  useEffect(() => {
    loadTax();
  }, []);

  const loadTax = async () => {
    if (!token) return;

    try {
      const data = await TaxService.getAll();
      if (data) {
        setTax(data);
        setFormData({
          firstLeaderPercentage: (data.firstLeaderPercentage * 100).toString(),
          secondLeaderPercentage: (data.secondLeaderPercentage * 100).toString(),
          mainChurchPercentage: (data.mainChurchPercentage * 100).toString(),
          ministryPercentage: (data.ministryPercentage * 100).toString(),
          mainLeaderPercentage: (data.mainLeaderPercentage * 100).toString(),
          transferMainLeaderPercentage: (data.transferMainLeaderPercentage * 100).toString(),
          transferMainChurchPercentage: (data.transferMainChurchPercentage * 100).toString(),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar taxas:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    if (!token) {
      setError('Token de autenticação não encontrado');
      return;
    }

    // Validar se todos os campos estão preenchidos
    const values = Object.values(formData);
    if (values.some(v => v === '' || isNaN(parseFloat(v)))) {
      setError('Todos os campos são obrigatórios e devem ser números válidos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const taxData = {
        firstLeaderPercentage: parseFloat(formData.firstLeaderPercentage) / 100,
        secondLeaderPercentage: parseFloat(formData.secondLeaderPercentage) / 100,
        mainChurchPercentage: parseFloat(formData.mainChurchPercentage) / 100,
        ministryPercentage: parseFloat(formData.ministryPercentage) / 100,
        mainLeaderPercentage: parseFloat(formData.mainLeaderPercentage) / 100,
        transferMainLeaderPercentage: parseFloat(formData.transferMainLeaderPercentage) / 100,
        transferMainChurchPercentage: parseFloat(formData.transferMainChurchPercentage) / 100,
      };

      if (tax) {
        await TaxService.update(tax.id, taxData, token);
      } else {
        await TaxService.create(taxData, token);
      }

      await loadTax();
      setSuccess('Taxas atualizadas com sucesso!');
      handleClose();
    } catch (error) {
      setError('Erro ao salvar taxas');
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Configuração de Taxas
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie as porcentagens de distribuição dos valores
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Edit />} onClick={handleOpen}>
            Editar Taxas
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {tax ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Lançamentos Oficiais
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Primeiro Líder
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatPercentage(tax.firstLeaderPercentage)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Segundo Líder
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatPercentage(tax.secondLeaderPercentage)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Igreja Principal
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatPercentage(tax.mainChurchPercentage)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Ministério
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatPercentage(tax.ministryPercentage)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Líder Principal
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatPercentage(tax.mainLeaderPercentage)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Transferências
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Líder Principal (Transferência)
                      </Typography>
                      <Typography variant="h5" color="info.main">
                        {formatPercentage(tax.transferMainLeaderPercentage)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Igreja Principal (Transferência)
                      </Typography>
                      <Typography variant="h5" color="info.main">
                        {formatPercentage(tax.transferMainChurchPercentage)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Última Atualização
                </Typography>
                <Typography variant="body1">
                  {formatDate(tax.updatedAt)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Nenhuma configuração de taxa encontrada. Clique em "Editar Taxas" para criar.
            </Typography>
          </Paper>
        )}

        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>Editar Configuração de Taxas</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="h6" sx={{ mt: 2, mb: 2 }} color="primary">
              Lançamentos Oficiais (%)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Primeiro Líder (%)"
                  type="number"
                  value={formData.firstLeaderPercentage}
                  onChange={(e) => setFormData({ ...formData, firstLeaderPercentage: e.target.value })}
                  inputProps={{ step: '0.01', min: '0', max: '100' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Segundo Líder (%)"
                  type="number"
                  value={formData.secondLeaderPercentage}
                  onChange={(e) => setFormData({ ...formData, secondLeaderPercentage: e.target.value })}
                  inputProps={{ step: '0.01', min: '0', max: '100' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Igreja Principal (%)"
                  type="number"
                  value={formData.mainChurchPercentage}
                  onChange={(e) => setFormData({ ...formData, mainChurchPercentage: e.target.value })}
                  inputProps={{ step: '0.01', min: '0', max: '100' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ministério (%)"
                  type="number"
                  value={formData.ministryPercentage}
                  onChange={(e) => setFormData({ ...formData, ministryPercentage: e.target.value })}
                  inputProps={{ step: '0.01', min: '0', max: '100' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Líder Principal (%)"
                  type="number"
                  value={formData.mainLeaderPercentage}
                  onChange={(e) => setFormData({ ...formData, mainLeaderPercentage: e.target.value })}
                  inputProps={{ step: '0.01', min: '0', max: '100' }}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }} color="primary">
              Transferências (%)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Líder Principal - Transferência (%)"
                  type="number"
                  value={formData.transferMainLeaderPercentage}
                  onChange={(e) => setFormData({ ...formData, transferMainLeaderPercentage: e.target.value })}
                  inputProps={{ step: '0.01', min: '0', max: '100' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Igreja Principal - Transferência (%)"
                  type="number"
                  value={formData.transferMainChurchPercentage}
                  onChange={(e) => setFormData({ ...formData, transferMainChurchPercentage: e.target.value })}
                  inputProps={{ step: '0.01', min: '0', max: '100' }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading} startIcon={<Save />}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
