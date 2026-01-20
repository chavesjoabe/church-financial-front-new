import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem as MenuItemButton,
  Tabs,
  Tab,
} from '@mui/material';
import { Search, Download, PictureAsPdf, TableChart } from '@mui/icons-material';
import { BalanceService } from '../services/balanceService';
import { ReportData, BalanceItem, NonOficialBalance } from '../types';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Relatorios() {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'accounting',
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const openMenu = Boolean(anchorEl);

  const handleSearch = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert('Por favor, selecione o período');
      return;
    }

    if (!token) {
      alert('Token de autenticação não encontrado');
      return;
    }

    setLoading(true);

    try {
      const data = await BalanceService.extractReport(filters.startDate, filters.endDate, filters.type);
      setReportData(data);
    } catch (error) {
      alert('Erro ao gerar relatório');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleExportPDF = () => {
    handleMenuClose();

    if (!reportData) {
      alert('Nenhum dado para exportar');
      return;
    }

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro - Ebenezer Tesouraria', 14, 20);

    // Período
    doc.setFontSize(11);
    doc.text(`Período: ${new Date(filters.startDate).toLocaleDateString('pt-BR')} a ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`, 14, 30);

    let startY = 40;

    // Resumo Geral
    doc.setFontSize(12);
    doc.text('Resumo Geral', 14, startY);
    startY += 6;

    doc.setFontSize(10);
    doc.text(`Total Lançamentos Oficiais: ${formatCurrency(reportData.balancesTotal.total)}`, 14, startY);
    startY += 6;
    doc.text(`Total Transferências: ${formatCurrency(reportData.transferBalancesTotal.total)}`, 14, startY);
    startY += 6;
    doc.text(`Total Transferências GEOL: ${formatCurrency(reportData.transferGeolBalancesTotal.total)}`, 14, startY);
    startY += 6;

    const totalNonOficial = reportData.nonOficialBalances.reduce((sum, b) => sum + b.value, 0);
    doc.text(`Total Não Oficial: ${formatCurrency(totalNonOficial)}`, 14, startY);
    startY += 10;

    // Lançamentos Oficiais
    if (reportData.balances.length > 0) {
      doc.setFontSize(12);
      doc.text('Lançamentos Oficiais', 14, startY);
      startY += 6;

      autoTable(doc, {
        startY: startY,
        head: [['Data', 'Tipo', 'Descrição', 'Valor', 'Líder 1', 'Líder 2', 'Igreja Principal', 'Ministério', 'Líder Principal']],
        body: reportData.balances.map((b) => [
          new Date(b.balanceDate).toLocaleDateString('pt-BR'),
          b.type === 'INCOMING' ? 'Entrada' : 'Saída',
          `${b.description} - ${b.freeDescription}`,
          formatCurrency(b.value),
          formatCurrency(b.churchFirstLeaderPercentage),
          formatCurrency(b.churchSecondLeaderPercentage),
          formatCurrency(b.mainChurchPercentage),
          formatCurrency(b.ministryPercentage),
          formatCurrency(b.mainLeaderPercentage),
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Transferências
    if (reportData.transferBalances.length > 0) {
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(12);
      doc.text('Transferências', 14, startY);
      startY += 6;

      autoTable(doc, {
        startY: startY,
        head: [['Data', 'Descrição', 'Valor', 'Líder 1', 'Líder 2', 'Igreja Principal', 'Ministério', 'Líder Principal']],
        body: reportData.transferBalances.map((b) => [
          new Date(b.balanceDate).toLocaleDateString('pt-BR'),
          `${b.description} - ${b.freeDescription}`,
          formatCurrency(b.value),
          formatCurrency(b.churchFirstLeaderPercentage),
          formatCurrency(b.churchSecondLeaderPercentage),
          formatCurrency(b.mainChurchPercentage),
          formatCurrency(b.ministryPercentage),
          formatCurrency(b.mainLeaderPercentage),
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Transferências GEOL
    if (reportData.transferGeolBalances.length > 0) {
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(12);
      doc.text('Transferências GEOL', 14, startY);
      startY += 6;

      autoTable(doc, {
        startY: startY,
        head: [['Data', 'Descrição', 'Valor', 'Líder 1', 'Líder 2', 'Igreja Principal', 'Ministério', 'Líder Principal']],
        body: reportData.transferGeolBalances.map((b) => [
          new Date(b.balanceDate).toLocaleDateString('pt-BR'),
          `${b.description} - ${b.freeDescription}`,
          formatCurrency(b.value),
          formatCurrency(b.churchFirstLeaderPercentage),
          formatCurrency(b.churchSecondLeaderPercentage),
          formatCurrency(b.mainChurchPercentage),
          formatCurrency(b.ministryPercentage),
          formatCurrency(b.mainLeaderPercentage),
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Não Oficiais
    if (reportData.nonOficialBalances.length > 0) {
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(12);
      doc.text('Lançamentos Não Oficiais', 14, startY);
      startY += 6;

      autoTable(doc, {
        startY: startY,
        head: [['Data', 'Tipo', 'Descrição', 'Valor', 'Responsável', 'Status']],
        body: reportData.nonOficialBalances.map((b) => [
          new Date(b.balanceDate).toLocaleDateString('pt-BR'),
          b.type === 'INCOMING' ? 'Entrada' : 'Saída',
          `${b.description} - ${b.freeDescription}`,
          formatCurrency(b.value),
          b.responsibleName,
          b.status,
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    doc.save(`relatorio-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportExcel = () => {
    handleMenuClose();

    if (!reportData) {
      alert('Nenhum dado para exportar');
      return;
    }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Resumo
    const summaryData = [
      ['Relatório Financeiro - Ebenezer Tesouraria'],
      [`Período: ${new Date(filters.startDate).toLocaleDateString('pt-BR')} a ${new Date(filters.endDate).toLocaleDateString('pt-BR')}`],
      [],
      ['Resumo Geral'],
      ['Total Lançamentos Oficiais', reportData.balancesTotal.total],
      ['Total Transferências', reportData.transferBalancesTotal.total],
      ['Total Transferências GEOL', reportData.transferGeolBalancesTotal.total],
      ['Total Não Oficial', reportData.nonOficialBalances.reduce((sum, b) => sum + b.value, 0)],
      [],
      ['Distribuição - Lançamentos Oficiais'],
      ['Líder 1', reportData.balancesTotal.churchFirstLeaderPercentage],
      ['Líder 2', reportData.balancesTotal.churchSecondLeaderPercentage],
      ['Igreja Principal', reportData.balancesTotal.mainChurchPercentage],
      ['Ministério', reportData.balancesTotal.ministryPercentage],
      ['Líder Principal', reportData.balancesTotal.mainLeaderPercentage],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

    // Sheet 2: Lançamentos Oficiais
    if (reportData.balances.length > 0) {
      const balancesData = [
        ['Data', 'Tipo', 'Descrição', 'Descrição Livre', 'Valor', 'Líder 1', 'Líder 2', 'Igreja Principal', 'Ministério', 'Líder Principal'],
        ...reportData.balances.map((b) => [
          new Date(b.balanceDate).toLocaleDateString('pt-BR'),
          b.type === 'INCOMING' ? 'Entrada' : 'Saída',
          b.description,
          b.freeDescription,
          b.value,
          b.churchFirstLeaderPercentage,
          b.churchSecondLeaderPercentage,
          b.mainChurchPercentage,
          b.ministryPercentage,
          b.mainLeaderPercentage,
        ]),
      ];
      const wsBalances = XLSX.utils.aoa_to_sheet(balancesData);
      XLSX.utils.book_append_sheet(wb, wsBalances, 'Lançamentos Oficiais');
    }

    // Sheet 3: Transferências
    if (reportData.transferBalances.length > 0) {
      const transferData = [
        ['Data', 'Descrição', 'Descrição Livre', 'Valor', 'Líder 1', 'Líder 2', 'Igreja Principal', 'Ministério', 'Líder Principal'],
        ...reportData.transferBalances.map((b) => [
          new Date(b.balanceDate).toLocaleDateString('pt-BR'),
          b.description,
          b.freeDescription,
          b.value,
          b.churchFirstLeaderPercentage,
          b.churchSecondLeaderPercentage,
          b.mainChurchPercentage,
          b.ministryPercentage,
          b.mainLeaderPercentage,
        ]),
      ];
      const wsTransfer = XLSX.utils.aoa_to_sheet(transferData);
      XLSX.utils.book_append_sheet(wb, wsTransfer, 'Transferências');
    }

    // Sheet 4: Transferências GEOL
    if (reportData.transferGeolBalances.length > 0) {
      const transferGeolData = [
        ['Data', 'Descrição', 'Descrição Livre', 'Valor', 'Líder 1', 'Líder 2', 'Igreja Principal', 'Ministério', 'Líder Principal'],
        ...reportData.transferGeolBalances.map((b) => [
          new Date(b.balanceDate).toLocaleDateString('pt-BR'),
          b.description,
          b.freeDescription,
          b.value,
          b.churchFirstLeaderPercentage,
          b.churchSecondLeaderPercentage,
          b.mainChurchPercentage,
          b.ministryPercentage,
          b.mainLeaderPercentage,
        ]),
      ];
      const wsTransferGeol = XLSX.utils.aoa_to_sheet(transferGeolData);
      XLSX.utils.book_append_sheet(wb, wsTransferGeol, 'Transferências GEOL');
    }

    // Sheet 5: Não Oficial
    if (reportData.nonOficialBalances.length > 0) {
      const nonOficialData = [
        ['Data', 'Tipo', 'Descrição', 'Descrição Livre', 'Valor', 'Responsável', 'Status'],
        ...reportData.nonOficialBalances.map((b) => [
          new Date(b.balanceDate).toLocaleDateString('pt-BR'),
          b.type === 'INCOMING' ? 'Entrada' : 'Saída',
          b.description,
          b.freeDescription,
          b.value,
          b.responsibleName,
          b.status,
        ]),
      ];
      const wsNonOficial = XLSX.utils.aoa_to_sheet(nonOficialData);
      XLSX.utils.book_append_sheet(wb, wsNonOficial, 'Não Oficial');
    }

    XLSX.writeFile(wb, `relatorio-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (stringDate: string): string => {
    const date = new Date(stringDate);
    const formatedDate = date.setHours(date.getHours() + 3);

    return new Date(formatedDate).toLocaleDateString('pt-BR')
  };

  const renderBalanceTable = (balances: BalanceItem[], title: string) => (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        {title}
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Descrição Livre</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="right">Líder 1</TableCell>
              <TableCell align="right">Líder 2</TableCell>
              <TableCell align="right">Igreja Principal</TableCell>
              <TableCell align="right">Ministério</TableCell>
              <TableCell align="right">Líder Principal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.map((balance, index) => (
              <TableRow key={index}>
                <TableCell>{formatDate(balance.balanceDate)}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={balance.type === 'INCOMING' ? 'success.main' : 'error.main'}
                  >
                    {balance.type === 'INCOMING' ? 'Entrada' : 'Saída'}
                  </Typography>
                </TableCell>
                <TableCell>{balance.description}</TableCell>
                <TableCell>{balance.freeDescription}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(balance.value)}
                </TableCell>
                <TableCell align="right">{formatCurrency(balance.churchFirstLeaderPercentage)}</TableCell>
                <TableCell align="right">{formatCurrency(balance.churchSecondLeaderPercentage)}</TableCell>
                <TableCell align="right">{formatCurrency(balance.mainChurchPercentage)}</TableCell>
                <TableCell align="right">{formatCurrency(balance.ministryPercentage)}</TableCell>
                <TableCell align="right">{formatCurrency(balance.mainLeaderPercentage)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderNonOficialTable = (balances: NonOficialBalance[]) => (
    <>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Lançamentos Não Oficiais
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Descrição Livre</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.id}>
                <TableCell>{formatDate(balance.balanceDate)}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={balance.type === 'INCOMING' ? 'success.main' : 'error.main'}
                  >
                    {balance.type === 'INCOMING' ? 'Entrada' : 'Saída'}
                  </Typography>
                </TableCell>
                <TableCell>{balance.description}</TableCell>
                <TableCell>{balance.freeDescription}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(balance.value)}
                </TableCell>
                <TableCell>{balance.responsibleName}</TableCell>
                <TableCell>{balance.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Relatórios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gere relatórios financeiros personalizados
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data Inicial"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data Final"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.type}
                label="Tipo"
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <MenuItem value="accounting">Entradas</MenuItem>
                <MenuItem value="outgoing">Saídas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: 56 }}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumo Geral
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Lançamentos Oficiais
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(reportData.balancesTotal.total)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Transferências
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(reportData.transferBalancesTotal.total)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Transferências GEOL
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatCurrency(reportData.transferGeolBalancesTotal.total)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Não Oficial
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {formatCurrency(reportData.nonOficialBalances.reduce((sum, b) => sum + b.value, 0))}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleMenuClick}
            >
              Exportar
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
            >
              <MenuItemButton onClick={handleExportPDF}>
                <PictureAsPdf sx={{ mr: 1 }} />
                Exportar PDF
              </MenuItemButton>
              <MenuItemButton onClick={handleExportExcel}>
                <TableChart sx={{ mr: 1 }} />
                Exportar Excel
              </MenuItemButton>
            </Menu>
          </Box>

          <Paper sx={{ mb: 3 }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="Lançamentos Oficiais" />
              <Tab label="Transferências" />
              <Tab label="Transferências GEOL" />
              <Tab label="Não Oficial" />
            </Tabs>
            <Box sx={{ p: 2 }}>
              {currentTab === 0 && reportData.balances.length > 0 &&
                renderBalanceTable(reportData.balances, 'Lançamentos Oficiais')}
              {currentTab === 1 && reportData.transferBalances.length > 0 &&
                renderBalanceTable(reportData.transferBalances, 'Transferências')}
              {currentTab === 2 && reportData.transferGeolBalances.length > 0 &&
                renderBalanceTable(reportData.transferGeolBalances, 'Transferências GEOL')}
              {currentTab === 3 && reportData.nonOficialBalances.length > 0 &&
                renderNonOficialTable(reportData.nonOficialBalances)}
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}
