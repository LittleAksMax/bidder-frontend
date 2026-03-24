import { FC } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Product } from '../api/types';
import './ProductsList.css';

interface ProductsListProps {
  products: Product[];
}

const ProductsList: FC<ProductsListProps> = ({ products }) => (
  <ListGroup className="ms-4">
    {products.map((product) => (
      <ListGroup.Item
        key={product.id}
        className="d-flex justify-content-between align-items-center products-list-item"
      >
        <span>
          <strong>{product.sku}</strong> - {product.name}
        </span>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

export default ProductsList;
