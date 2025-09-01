import React, { useCallback, useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  Alert,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Update as UpdateIcon,
  Comment as CommentIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import {  formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Components
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import LoadingSpinner from "./common/LoadingSpinner";

// Services
import { articleService } from "../services/api";

function ArticleDetail({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);

  // Définir fetchArticle d'abord
  const fetchArticle = useCallback (async () => {
    try {
      setLoading(true);
      setError("");
      const articleData = await articleService.getById(id);
      setArticle(articleData);
      setComments(articleData.comments || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement de l'article");
      console.error("Error fetching article:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Puis l'utiliser dans useEffect
  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  

  const handleCommentAdded = (newComment) => {
    setComments(prev => [...prev, newComment]);
    // Mettre à jour le compteur de commentaires
    setArticle(prev => ({
      ...prev,
      comments_count: (prev.comments_count || 0) + 1
    }));
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    setArticle(prev => ({
      ...prev,
      comments_count: Math.max(0, (prev.comments_count || 0) - 1)
    }));
  };


  const formatRelativeDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow( date, { addSuffix: true, locale: fr } );
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement de l'article..." />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Article non trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            L'article que vous recherchez n'existe pas ou a été supprimé.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Article non trouvé
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          sx={{ cursor: "pointer" }}
        >
          Accueil
        </MuiLink>
        <Typography color="text.primary">{article.title}</Typography>
      </Breadcrumbs>

      {/* Bouton retour */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
        aria-label="Retour"
      >
        <ArrowBackIcon />
        <Typography variant="body2" sx={{ ml: 1 }}>
          Retour
        </Typography>
      </IconButton>

      <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, mb: 4 }}>
        {/* En-tête de l'article */}
        <Box sx={{ mb: 4 }}>
          {article.category && (
            <Chip
              label={article.category}
              color="primary"
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}
          
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {article.title}
          </Typography>

          {/* Métadonnées de l'article */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                {article.author.charAt(0).toUpperCase() || <PersonIcon />}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                Par {article.author || "Auteur inconnu"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Publié {formatRelativeDate(article.created_at)}
              </Typography>
            </Box>

            {article.created_at !== article.updated_at && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <UpdateIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Modifié {formatRelativeDate(article.updated_at)}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CommentIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {article.comments_count || 0} commentaire{article.comments_count !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Contenu de l'article */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              fontSize: "1.1rem",
              whiteSpace: "pre-wrap",
            }}
          >
            {article.content}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section commentaires */}
        <Box>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
            💬 Commentaires ({article.comments_count || 0})
          </Typography>

          <CommentList
            comments={comments}
            articleId={article.id}
            token={token}
            onCommentDeleted={handleCommentDeleted}
          />

          {token ? (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Ajouter un commentaire
              </Typography>
              <CommentForm
                articleId={article.id}
                token={token}
                onCommentAdded={handleCommentAdded}
              />
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 3 }}>
              Connectez-vous pour ajouter un commentaire
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default ArticleDetail;