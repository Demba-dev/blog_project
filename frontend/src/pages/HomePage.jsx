import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Fab,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Slide,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  TrendingUp,
  NewReleases,
  Whatshot,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Components
import ArticleList from "../components/ArticleList";
import AddArticleForm from "../components/AddArticleForm";
// import LoadingSpinner from "../components/common/LoadingSpinner";
import WelcomeHero from "../components/WelcomeHero";
import CategoryFilter from "../components/CategoryFilter";

// Services
import { articleService, categoryService } from "../services/api";

// Transition pour le dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`articles-tabpanel-${index}`}
      aria-labelledby={`articles-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function HomePage({ token, user }) {
  const [openDialog, setOpenDialog] = useState(false);

  // const [loading, setLoading] = useState(false);
  const [articlesUpdated, setArticlesUpdated] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("newest");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Options de tri
  const sortOptions = [
    { value: "newest", label: "Plus récents", icon: <NewReleases /> },
    { value: "popular", label: "Plus populaires", icon: <Whatshot /> },
    { value: "trending", label: "Tendances", icon: <TrendingUp /> },
  ];


  // Fonctions utilitaires
  const getTabName = (tabValue) => {
    const tabNames = {
      0: 'Tous les articles',
      1: 'Populaires', 
      2: 'Récemment publiés'
    };
    return tabNames[tabValue] || 'Inconnu';
    };

    const getSortLabel = (sortValue) => {
    const sortLabels = {
      'newest': 'Plus récents',
      'popular': 'Plus populaires', 
      'trending': 'Tendances',
      'title': 'Ordre alphabétique'
    };
    return sortLabels[sortValue] || sortValue;
  };
 
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleArticleAdded = () => {
    setArticlesUpdated((prev) => !prev);
    handleCloseDialog();
  };

  const handleTabChange = (event, newValue) => {
    // Validation de la valeur
    if (newValue >= 0 && newValue <= 2) { // Adaptez selon le nombre d'onglets
      setTabValue(newValue);
      
      // Analytics/Logging (optionnel)
      console.log(`Onglet changé: ${getTabName(newValue)}`);
      
      // Scroll to top pour une meilleure UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } else {
      console.warn('Valeur d\'onglet invalide:', newValue);
    }
  };



  const handleSortChange = (sortValue) => {
    // Validation des valeurs de tri autorisées
    const validSortValues = ['newest', 'popular', 'trending', 'title'];

    if (validSortValues.includes(sortValue)) {
      // Optimisation: éviter les re-rendus inutiles
      if (sortBy !== sortValue) {
        setSortBy(sortValue);
        
        // Analytics/Logging
        console.log(`Tri appliqué: ${getSortLabel(sortValue)}`);
        
        // Scroll to top pour une meilleure UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Réinitialiser la pagination
        // setPage(1);
        
        // Optionnel: sauvegarder la préférence utilisateur
        localStorage.setItem('preferredSort', sortValue);
      }
    } else {
      console.warn('Valeur de tri invalide:', sortValue);
    }
  };

 const handleCategoryChange = (category) => {
    console.log("Catégorie sélectionnée :", category);
    
    if (category && (category.id || category.value)) {
      // Supporte à la fois les objets {id, name} et les valeurs simples
      setSelectedCategory(typeof category === 'object' ? category.id : category);
    } else if (category === "" || category === null || category === undefined) {
      // Cas où on veut supprimer la sélection
      console.log("Aucune catégorie sélectionnée");
      setSelectedCategory(null);
    } else {
      console.warn("Catégorie invalide :", category);
      setSelectedCategory(null);
    }
  };



  const handleArticleClick = (articleId) => {
    navigate(`/articles/${articleId}`);
  };

  // Charger les catégories au montage
  useEffect(() => {
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

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const params = {}

        if (selectedCategory) {
          params.category = selectedCategory.id;
          
        }

        if (sortBy ==="newest") params.sort = "-created_at";
        else if (sortBy ==="popular") params.sort = "-likes_count";
        else if (sortBy ==="trending") params.sort = "-views_count";

        await articleService.getAll(params);
        // setArticles(data);
      } catch (err) {
        console.error("Erreur lors du chargement des articles:", err);
      }
    };
    fetchArticles();
  }, [selectedCategory, sortBy, articlesUpdated]);

  

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Hero Section */}
      {!token && <WelcomeHero />}

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
              }}
            >
              {token ? "Vos Articles" : "Découvrez nos Articles"}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              {token
                ? "Partagez vos idées et découvrez celles de la communauté"
                : "Explorez une variété d'articles passionnants écrits par notre communauté"}
            </Typography>
          </Box>

          {token && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Fab
                variant="extended"
                color="primary"
                onClick={handleOpenDialog}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                <AddIcon sx={{ mr: 1 }} />
                Nouvel Article
              </Fab>
            </Box>
          )}
        </Box>

        {/* Filters and Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="articles tabs"
                variant={isMobile ? "fullWidth" : "standard"}
              >
                <Tab label="Tous les articles" />
                <Tab label="Populaires" />
                <Tab label="Récemment publiés" />
              </Tabs>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: isMobile ? "flex-start" : "flex-end",
                  flexWrap: "wrap",
                }}
              >
                {/* Filtre par catégorie */}
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />

                {/* Filtre de tri */}
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {sortOptions.map((option) => (
                    <Chip
                      key={option.value}
                      icon={option.icon}
                      label={option.label}
                      onClick={() => handleSortChange(option.value)}
                      color={sortBy === option.value ? "primary" : "default"}
                      variant={sortBy === option.value ? "filled" : "outlined"}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Content */}
        <TabPanel value={tabValue} index={0}>
          <ArticleList
            
            token={token}
            refresh={articlesUpdated}
            category={selectedCategory}
            sortBy={sortBy}
            onArticleClick={handleArticleClick}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <ArticleList
            
            token={token}
            refresh={articlesUpdated}
            category={selectedCategory}
            sortBy="popular"
            onArticleClick={handleArticleClick}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <ArticleList
            
            token={token}
            refresh={articlesUpdated}
            category={selectedCategory}
            sortBy="newest"
            onArticleClick={handleArticleClick}
          />
        </TabPanel>
      </Container>

      {/* Floating Action Button for Mobile */}
      {token && (
        <Fab
          color="primary"
          aria-label="add article"
          onClick={handleOpenDialog}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            display: { xs: "flex", md: "none" },
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Dialog for Add Article */}
      <Dialog
        fullScreen={isMobile}
        open={openDialog}
        onClose={handleCloseDialog}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Nouvel Article
            </Typography>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <AddArticleForm
            token={token}
            onArticleAdded={handleArticleAdded}
            onCancel={handleCloseDialog}
          />
        </Box>
      </Dialog>
    </Box>
  );
}

export default HomePage;