import { FC } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Product } from '../api/types';

interface ProductsListProps {
  products: Product[];
}

const ProductsList: FC<ProductsListProps> = ({ products }) => (
  <ListGroup className="ms-4">
    {products.map((product) => (
      <ListGroup.Item
        key={product.id}
        style={{ paddingTop: 4, paddingBottom: 4 }}
        className="d-flex justify-content-between align-items-center"
      >
        <span>
          <strong>{product.sku}</strong> - {product.name}
        </span>
      </ListGroup.Item>
    ))}
  </ListGroup>
);

export default ProductsList;
