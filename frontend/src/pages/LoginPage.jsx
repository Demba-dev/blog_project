import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Login,
} from "@mui/icons-material";
import { authService } from "../services/api";

function LoginPage({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation simple
    if (!formData.username.trim() || !formData.password.trim()) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      const { token, user } = await authService.login(formData);
      onLogin(token, user);
      
      // Notification de succès (gérée par le composant parent ou un context)
      console.log("Connexion réussie !");
      
      // Redirection vers la page précédente ou la page d'accueil
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message || "Erreur de connexion. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleDemoLogin = () => {
    setFormData({
      username: "demo",
      password: "demopassword",
    });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            borderRadius: 2,
          }}
        >
          {/* Logo ou icône */}
          <Box
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              padding: 2,
              borderRadius: "50%",
              marginBottom: 2,
            }}
          >
            <Login sx={{ fontSize: 40 }} />
          </Box>

          <Typography component="h1" variant="h4" gutterBottom>
            Connexion
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Bienvenue sur notre blog. Connectez-vous pour accéder à votre espace.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
            {/* Champ Username */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nom d'utilisateur"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Champ Password */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Bouton de connexion */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Se connecter"
              )}
            </Button>

            {/* Bouton démo (optionnel) */}
            <Button
              fullWidth
              variant="outlined"
              onClick={handleDemoLogin}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Remplir avec un compte démo
            </Button>

            {/* Liens supplémentaires */}
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Pas encore de compte ?{" "}
                <Link
                  to="/register"
                  style={{
                    textDecoration: "none",
                    color: "primary.main",
                    fontWeight: "bold",
                  }}
                >
                  S'inscrire
                </Link>
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <Link
                  to="/forgot-password"
                  style={{
                    textDecoration: "none",
                    color: "text.secondary",
                  }}
                >
                  Mot de passe oublié ?
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Section d'information supplémentaire */}
        <Paper
          elevation={2}
          sx={{
            padding: 3,
            mt: 3,
            width: "100%",
            textAlign: "center",
            backgroundColor: "grey.50",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            💡 Conseil : Utilisez le même nom d'utilisateur et mot de passe que
            pour votre compte administrateur Django.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default LoginPage;