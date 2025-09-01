import React, { useState } from "react";
import axios from "axios";

function CommentForm({ articleId, onCommentAdded }) {
  const [content, setContent] = useState("");

    const token = localStorage.getItem('token');

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`http://127.0.0.1:8000/api/articles/${articleId}/comments/`, {
      content: content
    },
    { headers: { Authorization:`Bearer ${token}`} }
)
    .then(res => {
      onCommentAdded(res.data);  // ajoute le commentaire à la liste
      setContent("");
    })
    .catch(err => console.log(err));
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrire un commentaire..."
        required
      />
      <br/>
      <button type="submit">Ajouter un commentaire</button>
    </form>
  );
}

export default CommentForm;
