import axios from 'axios';

// Configuration de base de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Création de l'instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour les requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pour les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion des erreurs HTTP
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expiré ou invalide
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('unauthorized'));
          break;
        
        case 403:
          // Accès interdit
          console.error('Accès interdit:', data);
          break;
        
        case 404:
          // Ressource non trouvée
          console.error('Ressource non trouvée:', data);
          break;
        
        case 500:
          // Erreur serveur
          console.error('Erreur serveur:', data);
          break;
        
        default:
          console.error('Erreur API:', data);
      }
    } else if (error.request) {
      // Erreur réseau
      console.error('Erreur réseau:', error.request);
    } else {
      // Erreur de configuration
      console.error('Erreur de configuration:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  // Connexion
  login: async (credentials) => {
    try {
      const response = await api.post('/token/', credentials);
      const { access: token, refresh } = response.data;
      
      // Stockage du token
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh);
      
      // Récupération du profil utilisateur
      const userResponse = await api.get('/auth/profile/');
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      return { token, user: userResponse.data };
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Erreur de connexion');
    }
  },

  // Rafraîchissement du token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Aucun token de rafraîchissement');
      }

      const response = await api.post('/token/refresh/', {
        refresh: refreshToken,
      });

      const newToken = response.data.access;
      localStorage.setItem('token', newToken);
      
      return newToken;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Inscription
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de l\'inscription');
    }
  },

  // Profil utilisateur
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mise à jour du profil
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile/', userData);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la mise à jour');
    }
  },
};

// Service des articles
export const articleService = {
  // Récupérer tous les articles
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/articles/', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la récupération des articles');
    }
  },

  // Récupérer un article par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/articles/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la récupération de l\'article');
    }
  },
  // Récupérer les articles d’un utilisateur connecté
  getUserArticles: async()=>{
    try{
      const response = await api.get('/articles/my');
      return response.data;
    }catch(error){
      throw new Error(error.response?.data || 'Erreur lors de la récupération des articles de l’utilisateur' )
    }
  },

  // Créer un nouvel article
  create: async (articleData) => {
    try {
      const response = await api.post('/articles/', articleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la création de l\'article');
    }
  },

  // Mettre à jour un article
  update: async (id, articleData) => {
    try {
      const response = await api.put(`/articles/${id}/`, articleData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la mise à jour de l\'article');
    }
  },

  // Supprimer un article
  delete: async (id) => {
    try {
      await api.delete(`/articles/${id}/`);
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la suppression de l\'article');
    }
  },

  // Rechercher des articles
  search: async (query) => {
    try {
      const response = await api.get('/articles/search/', {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la recherche');
    }
  },

  // Ajouter un commentaire
  addComment: async (articleId, commentData) => {
    try {
      const response = await api.post(`/articles/${articleId}/comments/`, commentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de l\'ajout du commentaire');
    }
  },
};

// Service des commentaires
export const commentService = {
  // Récupérer les commentaires d'un article
  getByArticle: async (articleId) => {
    try {
      const response = await api.get(`/articles/${articleId}/comments/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la récupération des commentaires');
    }
  },

  // Supprimer un commentaire
  delete: async (articleId, commentId) => {
    try {
      await api.delete(`/articles/${articleId}/comments/${commentId}/`);
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la suppression du commentaire');
    }
  },

  // Mettre à jour un commentaire
  update: async (articleId, commentId, commentData) => {
    try {
      const response = await api.put(`/articles/${articleId}/comments/${commentId}/`, commentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la mise à jour du commentaire');
    }
  },
};

// Service des catégories
export const categoryService = {
  // Récupérer toutes les catégories
  getAll: async () => {
    try {
      const response = await api.get('/categories/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la récupération des catégories');
    }
  },

  // Récupérer les articles d'une catégorie
  getArticles: async (categoryId) => {
    try {
      const response = await api.get(`/categories/${categoryId}/articles/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la récupération des articles de la catégorie');
    }
  },
};

// Service des favoris
export const favoriteService = {
  // Ajouter aux favoris
  add: async (articleId) => {
    try {
      const response = await api.post(`/articles/${articleId}/favorite/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de l\'ajout aux favoris');
    }
  },

  // Retirer des favoris
  remove: async (articleId) => {
    try {
      await api.delete(`/articles/${articleId}/favorite/`);
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la suppression des favoris');
    }
  },

  // Récupérer les favoris
  getFavorites: async () => {
    try {
      const response = await api.get('/auth/favorites/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la récupération des favoris');
    }
  },
};

// Service de statistiques
export const statsService = {
  // Récupérer les statistiques du blog
  getBlogStats: async () => {
    try {
      const response = await api.get('/stats/blog/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la récupération des statistiques');
    }
  },

  // Récupérer les statistiques utilisateur
  getUserStats: async () => {
    try {
      const response = await api.get('/auth/stats/');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Erreur lors de la récupération des statistiques utilisateur');
    }
  },
};

// Utilitaires
export const apiUtils = {
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Récupérer le token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Récupérer l'utilisateur
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Déconnexion manuelle
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

// Export par défaut
export default api;