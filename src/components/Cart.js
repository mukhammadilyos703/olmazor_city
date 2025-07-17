import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingCart } from 'react-icons/fi';

const CartContainer = styled.div`
  padding: 20px;
  min-height: 100vh;
  background: #f8f9fa;
`;

const CartHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
`;

const CartTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  svg {
    color: #667eea;
  }
`;

const CartSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  
  svg {
    font-size: 64px;
    color: #ddd;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 18px;
    margin-bottom: 10px;
    color: #333;
  }
  
  p {
    font-size: 14px;
    line-height: 1.5;
  }
`;

const CartItem = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px 0;
`;

const ItemPrice = styled.div`
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
`;

const ItemControls = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  border-radius: 25px;
  padding: 5px;
`;

const QuantityButton = styled(motion.button)`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666;
  
  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

const Quantity = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  min-width: 30px;
  text-align: center;
`;

const RemoveButton = styled(motion.button)`
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  svg {
    font-size: 14px;
  }
`;

const CartSummary = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
    font-weight: 700;
    font-size: 18px;
    color: #333;
  }
`;

const CheckoutButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
`;

const Cart = ({ cart, onUpdateQuantity, onRemoveItem }) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <CartContainer>
        <CartHeader>
          <CartTitle>
            <FiShoppingCart />
            Savatcha
          </CartTitle>
          <CartSubtitle>Tanlangan mahsulotlar</CartSubtitle>
        </CartHeader>
        <EmptyCart>
          <FiShoppingCart />
          <h3>Savatcha bo'sh</h3>
          <p>Menu bo'limiga o'tib, mahsulot tanlang</p>
        </EmptyCart>
      </CartContainer>
    );
  }

  return (
    <CartContainer>
      <CartHeader>
        <CartTitle>
          <FiShoppingCart />
          Savatcha
        </CartTitle>
        <CartSubtitle>{totalItems} ta mahsulot tanlangan</CartSubtitle>
      </CartHeader>

      {cart.map((item) => (
        <CartItem
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <ItemHeader>
            <ItemInfo>
              <ItemName>{item.name}</ItemName>
              <ItemPrice>{(item.price * item.quantity).toLocaleString()} so'm</ItemPrice>
            </ItemInfo>
            <RemoveButton
              onClick={() => onRemoveItem(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiTrash2 />
            </RemoveButton>
          </ItemHeader>
          
          <ItemControls>
            <QuantityControl>
              <QuantityButton
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiMinus />
              </QuantityButton>
              <Quantity>{item.quantity}</Quantity>
              <QuantityButton
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiPlus />
              </QuantityButton>
            </QuantityControl>
          </ItemControls>
        </CartItem>
      ))}

      <CartSummary>
        <SummaryRow>
          <span>Mahsulotlar ({totalItems})</span>
          <span>{totalPrice.toLocaleString()} so'm</span>
        </SummaryRow>
        <SummaryRow>
          <span>Yetkazib berish</span>
          <span>Bepul</span>
        </SummaryRow>
        <SummaryRow>
          <span>Jami</span>
          <span>{totalPrice.toLocaleString()} so'm</span>
        </SummaryRow>
      </CartSummary>

      <CheckoutButton
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Buyurtma berish
      </CheckoutButton>
    </CartContainer>
  );
};

export default Cart; 