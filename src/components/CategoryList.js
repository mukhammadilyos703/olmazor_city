import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getLang } from '../utils/lang';

const CategoryContainer = styled.div`
  padding: 20px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
`;

const CategoryTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
`;

const CategoryGrid = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }
`;

const CategoryButton = styled(motion.button)`
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 2px solid ${props => props.active ? 'transparent' : '#e0e0e0'};
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e9ecef'};
    transform: translateY(-2px);
  }
`;

const categoryIcons = {
  'all': '🍽️',
  'milliy': '🏺',
  'fastfood': '🍔',
  'ichimliklar': '🥤',
  'shirinliklar': '🍰',
  'salatlar': '🥗',
  'non': '🥖'
};

const categoryNames = {
  uz: {
    all: "Hammasi",
    milliy: "Milliy taomlar",
    fastfood: "Fast Food",
    ichimliklar: "Ichimliklar",
    shirinliklar: "Shirinliklar",
    salatlar: "Salatlar",
    non: "Non va pishiriqlar"
  },
  ru: {
    all: "Все",
    milliy: "Национальные блюда",
    fastfood: "Фастфуд",
    ichimliklar: "Напитки",
    shirinliklar: "Сладости",
    salatlar: "Салаты",
    non: "Хлеб и выпечка"
  }
};

const categoryTitle = {
  uz: "Kategoriyalar",
  ru: "Категории"
};

const CategoryList = ({ categories, selectedCategory, onCategorySelect }) => {
  const lang = getLang();
  return (
    <CategoryContainer>
      <CategoryTitle>{categoryTitle[lang]}</CategoryTitle>
      <CategoryGrid>
        {categories.map((category) => (
          <CategoryButton
            key={category}
            active={selectedCategory === category}
            onClick={() => onCategorySelect(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={{ marginRight: '5px' }}>{categoryIcons[category] || '🍽️'}</span>
            {categoryNames[lang][category] || category}
          </CategoryButton>
        ))}
      </CategoryGrid>
    </CategoryContainer>
  );
};

export default CategoryList; 