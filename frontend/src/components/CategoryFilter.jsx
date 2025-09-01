import React, { useState, useEffect } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
} from "@mui/material";
import { categoryService } from "../services/api";

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) return null;

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Catégorie</InputLabel>
      <Select
        value={selectedCategory || ""}
        label="Catégorie"
        onChange={(e) => onCategoryChange(e.target.value)}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <Chip
              label={categories.find(c => c.id === selected)?.name || "Toutes"}
              size="small"
            />
          </Box>
        )}
      >
        <MenuItem value="">
          <em>Toutes les catégories</em>
        </MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CategoryFilter;