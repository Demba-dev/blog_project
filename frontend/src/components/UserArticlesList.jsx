import React from "react";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  MoreVert as MoreIcon,
  Comment as CommentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { articleService } from "../services/api";

function UserArticlesList({ articles, showActions = true, onArticleUpdate }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedArticle, setSelectedArticle] = React.useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event, article) => {
    setAnchorEl(event.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };

  const handleView = () => {
    if (selectedArticle) {
      navigate(`/articles/${selectedArticle.id}`);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedArticle) {
      navigate(`/edit-article/${selectedArticle.id}`);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedArticle && onArticleUpdate) {
    //   Ici vous devriez appeler votre service de suppression
      await articleService.delete(selectedArticle.id);
      onArticleUpdate(); // Pour rafraîchir la liste
    }
    handleMenuClose();
  };

  if (!articles || articles.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Aucun article publié
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Commencez à partager vos idées avec la communauté !
        </Typography>
      </Box>
    );
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




  return (
    <Box>
      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} md={6} key={article.id}>
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
                {showActions && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    {getStatusChip(article)}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, article)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>
                )}

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

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <VisibilityIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {article.view_count || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CommentIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {article.comments_count || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  onClick={() => navigate(`/articles/${article.id}`)}
                >
                  Voir l'article
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Menu contextuel */}
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
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Supprimer
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default UserArticlesList;