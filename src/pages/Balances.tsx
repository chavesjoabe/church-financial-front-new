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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  InputLabel,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import { Add, Delete, Check, Search } from '@mui/icons-material';
import { BalanceService } from '../services/balanceService';
import { Balance } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Balances() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const [formData, setFormData] = useState({
    description: '',
    value: '',
    balanceDate: new Date().toISOString().split('T')[0],
    category: '',
    type: 'INCOMING' as 'INCOMING' | 'OUTGOING',
    unofficial: false,
    incomingType: "OFICIAL",
    paymentMethod: '',
  });

  const handleSearch = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert('Por favor, preencha ambas as datas para buscar');
      return;
    }

    setSearchLoading(true);
    try {
      const data = await BalanceService.getAllByDate(filters.startDate, filters.endDate);
      setBalances(data);
    } catch (error) {
      console.error('Error loading balances:', error);
      alert('Erro ao buscar lançamentos');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleOpen = (balance?: Balance) => {
    if (balance) {
      setEditingId(balance.id);
      setFormData({
        description: balance.description,
        value: balance.value.toString(),
        balanceDate: balance.balanceDate.split('T')[0],
        category: balance.category,
        type: balance.type,
        unofficial: balance.unofficial || false,
        incomingType: balance.unofficial ? "NON_OFICIAL" : "OFICIAL",
        paymentMethod: "MONEY"
      });
    } else {
      setEditingId(null);
      setFormData({
        description: '',
        value: '',
        balanceDate: new Date().toISOString().split('T')[0],
        category: '',
        type: 'INCOMING',
        unofficial: false,
        paymentMethod: 'MONEY',
        incomingType: 'OFICIAL'
      });
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleTypeChange = (newType: 'INCOMING' | 'OUTGOING') => {
    setFormData({
      ...formData,
      type: newType,
      unofficial: newType === 'OUTGOING' ? false : formData.unofficial,
      incomingType: formData.unofficial ? "NON_OFICIAL" : "OFICIAL",
      paymentMethod: formData.paymentMethod,
    });
  };

  const handleSubmit = async () => {
    if (!formData.description || !formData.value || !formData.balanceDate || !formData.category) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (formData.type === 'INCOMING' && !formData.paymentMethod) {
      setError('Forma de pagamento é obrigatória para entradas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const balanceData: Partial<Balance> = {
        description: formData.description,
        value: parseFloat(formData.value),
        balanceDate: new Date(formData.balanceDate).toISOString(),
        category: formData.category,
        type: formData.type,
        paymentMethod: 'MONEY',
      };

      if (formData.type === 'INCOMING') {
        balanceData.unofficial = formData.unofficial;
        balanceData.incomingType = formData.unofficial ? "NON_OFICIAL" : "OFICIAL";
      }

      if (editingId) {
        await BalanceService.update(editingId, balanceData);
      } else {
        await BalanceService.create({
          ...balanceData,
          createdBy: user?.document || 'Sistema',
        } as Omit<Balance, 'id' | 'createdAt'>);
      }

      // Refresh the list if filters are set
      if (filters.startDate && filters.endDate) {
        await handleSearch();
      }
      handleClose();
    } catch (error) {
      setError('Erro ao salvar lançamento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este lançamento?')) {
      try {
        await BalanceService.delete(id);
        // Refresh the list if filters are set
        if (filters.startDate && filters.endDate) {
          await handleSearch();
        }
      } catch (error) {
        alert('Erro ao excluir lançamento');
      }
    }
  };

  const handleApprove = async (id: string) => {
    if (window.confirm('Deseja aprovar este lançamento?')) {
      try {
        await BalanceService.approve(id);
        // Refresh the list if filters are set
        if (filters.startDate && filters.endDate) {
          await handleSearch();
        }
      } catch (error) {
        alert('Erro ao aprovar lançamento');
      }
    }
  };

  const canApprove = (balance: Balance) => {
    // User cannot approve their own balance
    return user?.document !== balance.responsible;
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

  const outgoingCategories = [
    "ALIMENTAÇÃO",
    "OFERTA MISSIONÁRIA",
    "COMPRAS DIVERSAS",
    "PAGAMENTOS",
    "REEMBOLSOS",
    "OUTROS"
  ];


  const incomingCategories = [
    "DÍZIMOS",
    "OFERTAS",
    "VOTOS",
    "OUTROS"
  ];

  const paymentMethods = [
    'PIX',
    'MONEY',
    'CARD',
    'OTHER',
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
            Todos os Lançamentos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Visualize e gerencie todos os lançamentos financeiros
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          size={isMobile ? 'small' : 'medium'}
          fullWidth={isMobile}
        >
          {isMobile ? 'Novo' : 'Novo Lançamento'}
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Data Inicial"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Data Final"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={searchLoading}
              sx={{ height: 56 }}
            >
              {searchLoading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Data</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Categoria</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Forma de Pagamento</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Status</TableCell>
              <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Criado por</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  {filters.startDate && filters.endDate
                    ? 'Nenhum lançamento encontrado para o período selecionado'
                    : 'Selecione um período para buscar lançamentos'}
                </TableCell>
              </TableRow>
            ) : (
              balances.map((balance) => (
                <TableRow key={balance.id}>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {formatDate(balance.balanceDate)}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: balance.type === 'INCOMING' ? 'success.main' : 'error.main',
                        fontWeight: 'bold',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      }}
                    >
                      {balance.type === 'INCOMING' ? 'Entrada' : 'Saída'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {balance.description}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {balance.category}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    {balance.paymentMethod}
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
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    <Typography variant="caption" color="warning.main">
                      {balance.status}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                    {balance.responsibleName}
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
                        onClick={() => handleDelete(balance.id)}
                        color="error"
                        sx={{ padding: { xs: '4px', sm: '8px' } }}
                        title="Excluir"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '100%' : 'calc(100% - 64px)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 1 }}>Tipo de Lançamento</FormLabel>
            <RadioGroup
              row={!isMobile}
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value as 'INCOMING' | 'OUTGOING')}
            >
              <FormControlLabel value="INCOMING" control={<Radio />} label="Entrada" />
              <FormControlLabel value="OUTGOING" control={<Radio />} label="Saída" />
            </RadioGroup>
          </FormControl>

          <TextField
            autoFocus={!isMobile}
            margin="dense"
            label="Descrição"
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Valor"
            type="number"
            fullWidth
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            inputProps={{ step: '0.01', min: '0' }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Data"
            type="date"
            fullWidth
            value={formData.balanceDate}
            onChange={(e) => setFormData({ ...formData, balanceDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={formData.category}
              label="Categoria"
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {
                formData.type == "INCOMING" ?
                  incomingCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))

                  :

                  outgoingCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))
              }
            </Select>
          </FormControl>

          {formData.type === 'INCOMING' && (
            <>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.unofficial}
                    onChange={(e) => setFormData({ ...formData, unofficial: e.target.checked })}
                  />
                }
                label="Não Oficial"
                sx={{ mt: 1 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexDirection: isMobile ? 'column' : 'row', gap: 1 }}>
          <Button
            onClick={handleClose}
            fullWidth={isMobile}
            sx={{ order: isMobile ? 2 : 1 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            fullWidth={isMobile}
            sx={{ order: isMobile ? 1 : 2 }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
