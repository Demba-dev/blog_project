import React, { useCallback, useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Skeleton,
  Alert,
  Pagination,
  IconButton,
  Menu,

  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Services
import { articleService, favoriteService } from "../services/api";

function ArticleList({
  token,
  refresh,
  category = null,
  sortBy = "newest",
  onArticleClick,
}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const itemsPerPage = 9;

  
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        page_size: itemsPerPage,
        ...(category && { category: typeof category === "object" ? category.id : category }),
        ordering: getOrdering(sortBy),
      };

      const data = await articleService.getAll(params);
      
      setArticles(data.results || data);
      setTotalPages(data.total_pages || Math.ceil((data.count || data.length) / itemsPerPage));
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des articles");
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  }, [page, category, sortBy,itemsPerPage]);


  useEffect(() => {
    fetchArticles();
  }, [fetchArticles, refresh, token]);


  const getOrdering = (sortType) => {
    switch (sortType) {
      case "newest":
        return "-created_at";
      case "popular":
        return "-view_count";
      case "trending":
        return "-like_count";
      default:
        return "-created_at";
    }
  };

  const handleArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article.id);
    } else {
      navigate(`/articles/${article.id}`);
    }
  };

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
      fetchArticles(); // Rafraîchir la liste
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

  const handleToggleFavorite = async (articleId) => {
    if (!token) {
      navigate("/login");
      return;

    }

    try {
      const response = await favoriteService.add(articleId);

      // Mettre à jour l'article spécifique dans le tableau
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === articleId
            ? { ...article, is_favorite: response.is_favorite }
            : article
        )
      );

      // fetchArticles(); // optionnel, si tu veux mettre à jour counts/tri/etc.
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = (now - date) / (1000 * 60 * 60 * 24);

    if (diffInDays < 7) {
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } else {
      return format(new Date(dateString), "dd MMM yyyy", { locale: fr });
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!loading && articles.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          📝 Aucun article trouvé
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {category ? `Aucun article dans la catégorie sélectionnée` : "Soyez le premier à publier un article !"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {loading
          ? Array.from(new Array(6)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <Skeleton variant="rectangular" height={140} />
                  <CardContent>
                    <Skeleton variant="text" height={32} />
                    <Skeleton variant="text" height={72} />
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          : articles.map((article) => (
              <Grid item xs={12} sm={6} md={4} key={article.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                      cursor: "pointer",
                    },
                  }}
                  onClick={() => handleArticleClick(article)}
                >
                  {/* Image de l'article (optionnelle) */}
                  {article.image_url && (
                    <Box
                      sx={{
                        height: 140,
                        backgroundImage: `url(${article.image_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      {article.category && (
                        <Chip
                          label={article.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                      
                      {token && article.author?.id === JSON.parse(localStorage.getItem("user"))?.id && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuOpen(e, article);
                          }}
                        >
                          <MoreIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                      {article.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      {truncateContent(article.content)}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                        {article.author.charAt(0).toUpperCase() || <PersonIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" display="block" fontWeight="medium">
                          {article.author || "Auteur inconnu"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(article.created_at)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Chip
                        icon={<VisibilityIcon fontSize="small" />}
                        label={article.view_count || 0}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CommentIcon fontSize="small" />}
                        label={article.comments_count || 0}
                        size="small"
                        variant="outlined"
                      />
                      <IconButton
                        
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(article.id);
                        }}
                        color={article.is_favorite ? "error" : "default"}
                      >
                        {article.is_favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Modifier
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Supprimer
        </MenuItem>
      </Menu>

      {/* Dialog de confirmation de suppression */}
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
    </Box>
  );
}

export default ArticleList;