import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPlus, FiStar } from 'react-icons/fi';
import { getLang } from '../utils/lang';

const ItemContainer = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const ItemDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  
  svg {
    color: #ffd700;
    font-size: 14px;
  }
`;

const SpiceLevel = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
`;

const SpiceIcons = styled.div`
  display: flex;
  gap: 2px;
`;

const SpiceDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.active ? '#ff6b6b' : '#e0e0e0'};
`;

const ItemFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Price = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
`;

const AddButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  
  svg {
    font-size: 18px;
  }
`;

const PopularBadge = styled.div`
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ReviewsSection = styled.div`
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px solid #eee;
`;
const ReviewForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
`;
const ReviewList = styled.div`
  margin-top: 8px;
`;
const ReviewItem = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 6px;
  font-size: 14px;
`;
const StarButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.active ? '#ffd700' : '#ccc'};
  font-size: 18px;
  padding: 0 2px;
`;

const MenuItem = ({ item, onAddToCart }) => {
  const lang = getLang();
  const name = lang === 'ru' && item.name_ru ? item.name_ru : item.name;
  const description = lang === 'ru' && item.description_ru ? item.description_ru : item.description;
  const popularText = lang === 'ru' ? 'Популярное' : 'Mashhur';
  const spiceText = lang === 'ru' ? 'Острота:' : 'Achchiqlik:';

  // Sharh va reyting uchun state
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);

  // LocalStorage'dan sharhlarni olish
  useEffect(() => {
    const saved = localStorage.getItem('reviews_' + item.id);
    if (saved) setReviews(JSON.parse(saved));
  }, [item.id]);

  // Sharhni saqlash
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewText.trim() || reviewRating === 0) return;
    const newReview = {
      text: reviewText,
      rating: reviewRating,
      date: new Date().toISOString(),
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem('reviews_' + item.id, JSON.stringify(updated));
    setReviewText('');
    setReviewRating(0);
  };

  // O'rtacha reytingni hisoblash
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : item.rating;

  const renderSpiceLevel = (level) => {
    return (
      <SpiceIcons>
        {[1, 2, 3].map((dot) => (
          <SpiceDot key={dot} active={dot <= level} />
        ))}
      </SpiceIcons>
    );
  };

  return (
    <ItemContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ItemHeader>
        <ItemInfo>
          <ItemName>{name}</ItemName>
          <ItemDescription>{description}</ItemDescription>
        </ItemInfo>
        {item.popular && (
          <PopularBadge>{popularText}</PopularBadge>
        )}
      </ItemHeader>
      <ItemMeta>
        <Rating>
          <FiStar />
          <span>{avgRating}</span>
        </Rating>
        {item.spiceLevel > 0 && (
          <SpiceLevel>
            <span>{spiceText}</span>
            {renderSpiceLevel(item.spiceLevel)}
          </SpiceLevel>
        )}
      </ItemMeta>
      <ItemFooter>
        <Price>{item.price.toLocaleString()} so'm</Price>
        <AddButton
          onClick={() => onAddToCart(item)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiPlus />
        </AddButton>
      </ItemFooter>
      {/* Sharh va reyting bo'limi */}
      <ReviewsSection>
        <ReviewForm onSubmit={handleReviewSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <StarButton
                key={star}
                type="button"
                active={reviewRating >= star}
                onClick={() => setReviewRating(star)}
                aria-label={`Yulduzcha ${star}`}
              >
                ★
              </StarButton>
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder={lang === 'ru' ? 'Ваш отзыв...' : 'Sharhingiz...'}
            rows={2}
            style={{ borderRadius: 6, border: '1px solid #eee', padding: 6, resize: 'vertical' }}
          />
          <button type="submit" style={{ background: '#667eea', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
            {lang === 'ru' ? 'Отправить' : 'Yuborish'}
          </button>
        </ReviewForm>
        <ReviewList>
          {reviews.length === 0 ? (
            <div style={{ color: '#aaa', fontSize: 13 }}>{lang === 'ru' ? 'Sharhlar yo‘q' : 'Sharhlar yo‘q'}</div>
          ) : (
            reviews.map((r, i) => (
              <ReviewItem key={i}>
                <span style={{ color: '#ffd700', marginRight: 4 }}>{'★'.repeat(r.rating)}</span>
                <span>{r.text}</span>
                <span style={{ float: 'right', color: '#bbb', fontSize: 11, marginLeft: 8 }}>{new Date(r.date).toLocaleDateString()}</span>
              </ReviewItem>
            ))
          )}
        </ReviewList>
      </ReviewsSection>
    </ItemContainer>
  );
};

export default MenuItem; 