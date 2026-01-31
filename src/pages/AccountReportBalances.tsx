import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { CloudUpload, Info, CheckCircle } from '@mui/icons-material';
import { BalanceService } from '../services/balanceService';
import { useNavigate } from 'react-router-dom';

export default function AccountReportBalances() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      // Validate file type
      if (!fileName.toLowerCase().endsWith('.ofx')) {
        alert('Por favor, selecione um arquivo OFX válido');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo OFX');
      return;
    }

    setLoading(true);
    setOpenModal(true);
    setProcessingComplete(false);

    try {
      BalanceService.createBalanceByOfxFile(selectedFile); // without await to don't await the response.

      // Simulate processing time for better UX
      setTimeout(() => {
        setProcessingComplete(true);
        setLoading(false);
      }, 2000);

      // Clear file after successful upload
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('ofx-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading OFX file:', error);
      setLoading(false);
      setOpenModal(false);
      alert('Erro ao processar arquivo OFX. Verifique o formato do arquivo e tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setProcessingComplete(false);
  };

  const handleGoToPending = () => {
    navigate('/pending-balances');
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
          Importar Extrato Bancário (OFX)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Faça upload de um arquivo OFX para criar lançamentos automaticamente
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Info sx={{ mr: 1, color: 'info.main' }} />
            <Typography variant="h6">Como funciona?</Typography>
          </Box>
          <List dense>
            <ListItem>
              <ListItemText
                primary="1. Selecione um arquivo OFX do seu banco"
                secondary="O arquivo deve estar no formato OFX (Open Financial Exchange)"
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="2. O sistema identifica automaticamente entradas e saídas"
                secondary="Transações de crédito serão criadas como ENTRADAS e débitos como SAÍDAS"
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="3. Lançamentos são criados com status PENDENTE"
                secondary="Você poderá revisar e aprovar cada lançamento individualmente"
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemText
                primary="4. Revise os lançamentos na página 'Lançamentos Pendentes'"
                secondary="Aprove ou rejeite cada lançamento conforme necessário"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Selecionar Arquivo
        </Typography>

        <Box
          sx={{
            border: '2px dashed',
            borderColor: selectedFile ? 'success.main' : 'grey.600',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: selectedFile ? 'success.dark' : 'background.default',
            transition: 'all 0.3s',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => document.getElementById('ofx-file-input')?.click()}
        >
          <input
            id="ofx-file-input"
            type="file"
            accept=".ofx,.OFX"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <CloudUpload sx={{ fontSize: 48, color: selectedFile ? 'success.main' : 'grey.500', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {selectedFile ? selectedFile.name : 'Clique para selecionar um arquivo OFX'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedFile
              ? `Tamanho: ${(selectedFile.size / 1024).toFixed(2)} KB`
              : ''}
          </Typography>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
          <Button
            variant="outlined"
            onClick={() => {
              setSelectedFile(null);
              const fileInput = document.getElementById('ofx-file-input') as HTMLInputElement;
              if (fileInput) {
                fileInput.value = '';
              }
            }}
            disabled={!selectedFile || loading}
            fullWidth={isMobile}
          >
            Limpar
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            startIcon={<CloudUpload />}
            fullWidth={isMobile}
          >
            Processar Arquivo
          </Button>
        </Box>
      </Paper>

      {/* Processing Modal */}
      <Dialog
        open={openModal}
        onClose={processingComplete ? handleCloseModal : undefined}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={!processingComplete}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          {loading ? 'Processando Arquivo' : 'Recebimento do Arquivo Concluído'}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {loading ? (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Aguarde enquanto processamos seu arquivo OFX
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Estamos identificando as transações e criando os lançamentos...
              </Typography>
            </>
          ) : (
            <>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Arquivo recebido com sucesso!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Os lançamentos estão em processamento e serão criados no status PENDENTE.
              </Typography>
              <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                ⚠️ Em alguns instantes acesse a página "Lançamentos Pendentes" para revisar e aprovar cada lançamento.
              </Typography>
              <Typography variant="body2" color="warning.main" >
                Alguns lançamentos ainda podem estar em processamento, assim é necessário aguardar alguns momentos até que todos sejam importados
              </Typography>
            </>
          )}
        </DialogContent>
        {processingComplete && (
          <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
            <Button variant="outlined" onClick={handleCloseModal}>
              Fechar
            </Button>
            <Button variant="contained" onClick={handleGoToPending}>
              Ir para Lançamentos Pendentes
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
}
