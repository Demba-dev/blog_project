import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { Article, TrendingUp, Group } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Grid } from "@mui/material";

const WelcomeHero = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Article sx={{ fontSize: 40 }} />,
      title: "Articles Variés",
      description: "Découvrez des contenus diversifiés sur différents sujets",
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: "Tendances",
      description: "Restez informé des sujets les plus populaires",
    },
    {
      icon: <Group sx={{ fontSize: 40 }} />,
      title: "Communauté",
      description: "Rejoignez une communauté de passionnés d'écriture",
    },
  ];

  return (
    <Paper
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        py: 8,
        mb: 4,
        borderRadius: 0,
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Bienvenue sur Notre Blog
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Découvrez, partagez et connectez-vous avec une communauté de passionnés
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              S'inscrire
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Se Connecter
            </Button>
          </Box>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Paper>
  );
};

export default WelcomeHero;