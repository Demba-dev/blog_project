import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Avatar,
  TextField,
  Button,
  Tabs,
  Tab,
  
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Article as ArticleIcon,
  Comment as CommentIcon,
  Favorite as FavoriteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Services
import { authService, articleService } from "../services/api";

// Composants
// import ArticleList from "../components/ArticleList";
import LoadingSpinner from "../components/common/LoadingSpinner";
import UserArticlesList from "../components/UserArticlesList";


function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function ProfilePage({ user, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userArticles, setUserArticles] = useState([]);
  const [stats, setStats] = useState({
    articlesCount: 0,
    commentsCount: 0,
    likesCount: 0,
  });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    bio: "",
  });

  

  const loadUserData = useCallback( async () => {
    setLoading(true);
    try {
      
      // Charger les articles de l'utilisateur
      const articles = await articleService.getUserArticles(user.id);
      
      
      

      setUserArticles(articles);

      // Charger les statistiques (à adapter selon votre API)
      setStats({
        articlesCount: user.articles_count || 0,
        commentsCount: user.comments_count || 0,
        likesCount: user.likes_count || 0,
      });
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
    } finally {
      setLoading(false);
    }
  },[user]);

  useEffect(() => {
    if (!user) {
      console.warn("⚠️ Aucun user fourni à ProfilePage");
      return;
    }

      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
      });
      loadUserData();
  }, [user, loadUserData]);





  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setError("");
    setSuccess("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await authService.updateProfile(formData);
      onUpdateUser(updatedUser);
      setSuccess("Profil mis à jour avec succès !");
      setEditMode(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      username: user.username || "",
      email: user.email || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      bio: user.bio || "",
    });
    setEditMode(false);
    setError("");
    setSuccess("");
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return "Date d'inscription inconnue";
    try {
      const date = new Date(dateString);
      return `Membre depuis ${format(date, "MMMM yyyy", { locale: fr })}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement de votre profil..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Sidebar - Informations du profil */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: "sticky", top: 100 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "primary.main",
                  fontSize: "3rem",
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || <PersonIcon />}
              </Avatar>

              <Typography variant="h5" gutterBottom>
                {user?.username}
              </Typography>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {formatJoinDate(user?.date_joined)}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Statistiques */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Statistiques
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <ArticleIcon color="primary" />
                    <Typography variant="h6">{stats.articlesCount}</Typography>
                    <Typography variant="caption">Articles</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <CommentIcon color="secondary" />
                    <Typography variant="h6">{stats.commentsCount}</Typography>
                    <Typography variant="caption">Commentaires</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: "center" }}>
                    <FavoriteIcon color="error" />
                    <Typography variant="h6">{stats.likesCount}</Typography>
                    <Typography variant="caption">Likes</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Button
              fullWidth
              variant={editMode ? "outlined" : "contained"}
              startIcon={editMode ? <CancelIcon /> : <EditIcon />}
              onClick={handleEditToggle}
            >
              {editMode ? "Annuler" : "Modifier le profil"}
            </Button>
          </Paper>
        </Grid>

        {/* Contenu principal */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Mon Profil
            </Typography>

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

            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Informations" />
              <Tab label="Mes Articles" />
              <Tab label="Activité" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: "action.active" }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, color: "action.active" }} />
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!editMode || saving}
                    placeholder="Parlez-nous un peu de vous..."
                  />
                </Grid>

                {editMode && (
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                      <Button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        variant="outlined"
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                      >
                        {saving ? "Enregistrement..." : "Enregistrer"}
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Typography variant="h6" gutterBottom>
                Mes Articles ({userArticles.length})
              </Typography>
              {userArticles.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <ArticleIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Aucun article publié
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Commencez à partager vos idées avec la communauté !
                  </Typography>
                </Box>
              ) : (
                <UserArticlesList                  
                  articles={userArticles}
                  showActions={true}
                  onArticleUpdate={loadUserData}
                />
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Typography variant="h6" gutterBottom>
                Mon Activité Récente
              </Typography>
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  🚧 Cette section est en cours de développement
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bientôt vous pourrez voir votre historique d'activité ici
                </Typography>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ProfilePage;