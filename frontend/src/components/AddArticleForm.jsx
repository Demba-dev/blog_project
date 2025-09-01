import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Title as TitleIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { articleService, categoryService } from "../services/api";

function AddArticleForm({ token, onArticleAdded, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);

  // Charger les catégories
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Effacer les messages d'erreur lors de la modification
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Le titre et le contenu sont obligatoires");
      setLoading(false);
      return;
    }

    if (formData.title.length < 5) {
      setError("Le titre doit contenir au moins 5 caractères");
      setLoading(false);
      return;
    }

    if (formData.content.length < 50) {
      setError("Le contenu doit contenir au moins 50 caractères");
      setLoading(false);
      return;
    }

    try {
      const articleData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        ...(formData.category && { category: formData.category }),
        ...(formData.image_url && { image_url: formData.image_url.trim() }),
      };

      const newArticle = await articleService.create(articleData);
      
      setSuccess("Article créé avec succès !");
      setFormData({
        title: "",
        content: "",
        category: "",
        image_url: "",
      });
      
      // Callback pour mettre à jour la liste des articles
      if (onArticleAdded) {
        onArticleAdded(newArticle);
      }
      
      // Fermer automatiquement après 2 secondes
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 2000);
      
    } catch (err) {
      setError(
        err.message || 
        "Erreur lors de la création de l'article. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const characterCount = formData.content.length;
  const maxCharacters = 5000;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          ✍️ Nouvel Article
        </Typography>
        {onCancel && (
          <IconButton onClick={handleCancel} disabled={loading}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Titre */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Titre de l'article"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TitleIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Un titre accrocheur et descriptif"
            />
          </Grid>

          {/* Catégorie */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="Catégorie"
                onChange={handleChange}
                startAdornment={
                  <InputAdornment position="start">
                    <CategoryIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="">
                  <em>Aucune catégorie</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Image URL */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL de l'image (optionnel)"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ImageIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Lien vers une image d'illustration"
            />
          </Grid>

          {/* Contenu */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Contenu de l'article"
              name="content"
              value={formData.content}
              onChange={handleChange}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText={`${characterCount}/${maxCharacters} caractères - Minimum 50 caractères`}
              inputProps={{
                maxLength: maxCharacters,
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 0.5 }}>
              <Typography
                variant="caption"
                color={
                  characterCount > maxCharacters - 100
                    ? "error"
                    : characterCount > maxCharacters - 500
                    ? "warning.main"
                    : "text.secondary"
                }
              >
                {characterCount} / {maxCharacters}
              </Typography>
            </Box>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              {onCancel && (
                <Button
                  onClick={handleCancel}
                  disabled={loading}
                  variant="outlined"
                  color="inherit"
                >
                  Annuler
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formData.title.trim() || !formData.content.trim()}
                startIcon={loading ? <CircularProgress size={16} /> : null}
                sx={{ minWidth: 120 }}
              >
                {loading ? "Publication..." : "Publier"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Conseils de rédaction */}
      <Paper elevation={1} sx={{ p: 2, mt: 3, bgcolor: "grey.50" }}>
        <Typography variant="subtitle2" gutterBottom color="primary">
          💡 Conseils pour un bon article :
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Soignez votre titre accrocheur<br/>
          • Structurez votre contenu avec des paragraphes<br/>
          • Utilisez des exemples concrets<br/>
          • Relisez-vous avant de publier<br/>
          • Choisissez une image pertinente
        </Typography>
      </Paper>
    </Paper>
  );
}

export default AddArticleForm;