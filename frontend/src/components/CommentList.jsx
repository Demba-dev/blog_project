import React from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Person as PersonIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { commentService } from "../services/api";

function CommentList({ comments, articleId, token, onCommentDeleted }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedComment, setSelectedComment] = React.useState(null);

  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;
    
    try {
      await commentService.delete(articleId, selectedComment.id);
      onCommentDeleted(selectedComment.id);
    } catch (error) {
      console.error("Erreur suppression commentaire:", error);
    } finally {
      handleMenuClose();
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch {
      return dateString;
    }
  };

  if (comments.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Aucun commentaire pour le moment. Soyez le premier à commenter !
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {comments.map((comment) => (
        <Paper
          key={comment.id}
          elevation={1}
          sx={{ p: 3, mb: 2, position: "relative" }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main" }}>
                {comment.author?.charAt(0).toUpperCase() || <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="medium">
                  {comment.author || "Utilisateur"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(comment.created_at)}
                </Typography>
              </Box>
            </Box>

            {(token && comment.author?.id === JSON.parse(localStorage.getItem("user"))?.id) && (
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, comment)}
                aria-label="Options du commentaire"
              >
                <MoreIcon />
              </IconButton>
            )}
          </Box>

          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {comment.content}
          </Typography>
        </Paper>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteComment} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Supprimer
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default CommentList;