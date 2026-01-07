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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
} from '@mui/material';
import { Add, Delete, Edit, ToggleOn, ToggleOff } from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { UserService } from '../services/userService';
import { User } from '../types';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    document: '',
    role: 'COMMON' as 'ADMIN' | 'COMMON',
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const data = await UserService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleOpen = (usuario?: User) => {
    if (usuario) {
      setEditingId(usuario.id);
      setFormData({
        name: usuario.name,
        email: usuario.email,
        password: usuario.password,
        document: usuario.document,
        role: usuario.role,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        role: 'COMMON',
      });
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Nome e email são obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (editingId) {
        await UserService.update(editingId, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });
      } else {
        await UserService.create({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          document: formData.document,
        });
      }
      await loadUsuarios();
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este usuário?')) {
      try {
        await UserService.delete(id);
        await loadUsuarios();
      } catch (error) {
        alert('Erro ao excluir usuário');
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await UserService.toggleActive(id);
      await loadUsuarios();
    } catch (error) {
      alert('Erro ao alterar status do usuário');
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Usuários
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie os usuários do sistema
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Novo Usuário
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum usuário cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.name}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={usuario.role === 'admin' ? 'Administrador' : 'Usuário'}
                        size="small"
                        color={usuario.role === 'admin' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={usuario.active ? 'Ativo' : 'Inativo'}
                        size="small"
                        color={usuario.active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActive(usuario.id)}
                        color={usuario.active ? 'warning' : 'success'}
                      >
                        {usuario.active ? <ToggleOff /> : <ToggleOn />}
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpen(usuario)} color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(usuario.id)}
                        color="error"
                        disabled={usuario.id === '1'}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Nome"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              autoFocus
              margin="dense"
              label="Documento"
              fullWidth
              value={formData.document}
              onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Senha"
              type="password"
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Perfil</InputLabel>
              <Select
                value={formData.role}
                label="Perfil"
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'COMMON' })}
              >
                <MenuItem value="COMMON">Usuário</MenuItem>
                <MenuItem value="ADMIN">Administrador</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}
