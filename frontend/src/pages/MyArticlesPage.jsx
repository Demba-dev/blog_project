import React, { useCallback,useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
  Fab,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Comment as CommentIcon,
  MoreVert as MoreIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Services
import { articleService } from "../services/api";

// Components
import LoadingSpinner from "../components/common/LoadingSpinner";

function MyArticlesPage({ token, user }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  

  const fetchUserArticles = useCallback( async () => {
    try {
      setLoading(true);
      setError("");


      const userArticles = await articleService.getUserArticles(user.id);
    
      
      setArticles(userArticles);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement de vos articles");
      console.error("Error fetching user articles:", err);
    } finally {
      setLoading(false);
    };
  },[user?.id]);

  useEffect(() => {
    if (user && token) {
      fetchUserArticles();
    }
  }, [user, token, fetchUserArticles]);


  

  const handleMenuOpen = (event, article) => {
    setAnchorEl(event.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };

  const handleEdit = () => {
    if (selectedArticle) {
      navigate(`/edit-article/${selectedArticle.id}`);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedArticle) {
      navigate(`/articles/${selectedArticle.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedArticle) return;

    setDeleting(true);
    try {
      await articleService.delete(selectedArticle.id);
      setDeleteDialogOpen(false);
      // Recharger la liste après suppression
      await fetchUserArticles();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedArticle(null);
  };

  const handleCreateArticle = () => {
    navigate("/create-article");
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  const getStatusChip = (article) => {
    const isPublished = article.published !== false; // Adaptez selon votre modèle
    return (
      <Chip
        label={isPublished ? "Publié" : "Brouillon"}
        color={isPublished ? "success" : "default"}
        size="small"
        variant={isPublished ? "filled" : "outlined"}
      />
    );
  };

  console.log("User:", user);
  console.log("Token:", token);

  if (!token || !user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Vous devez être connecté pour voir vos articles.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Chargement de vos articles..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Mes Articles
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {articles.length} article{articles.length !== 1 ? 's' : ''} publié{articles.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateArticle}
          size="large"
        >
          Nouvel Article
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Articles List */}
      {articles.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "grey.50",
          }}
        >
          <ArticleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Aucun article pour le moment
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Commencez à partager vos idées avec la communauté en créant votre premier article.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateArticle}
          >
            Créer mon premier article
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {articles.map((article) => (
            <Grid item xs={12} md={6} lg={4} key={article.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    {getStatusChip(article)}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, article)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {article.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 2,
                    }}
                  >
                    {article.content}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <VisibilityIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {article.view_count || 0} vues
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CommentIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {article.comments_count || 0} commentaires
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(article.created_at)}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => navigate(`/articles/${article.id}`)}
                  >
                    Voir
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add article"
        onClick={handleCreateArticle}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", md: "none" },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          Voir l'article
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Modifier
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Supprimer
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'article "{selectedArticle?.title}" ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyArticlesPage;