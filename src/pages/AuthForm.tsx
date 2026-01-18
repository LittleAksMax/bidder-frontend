import { FC, ReactNode } from 'react';
import { Card, Button, Form, InputGroup } from 'react-bootstrap';

interface AuthFormProps {
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
}

const AuthForm: FC<AuthFormProps> = ({ title, children, onSubmit, submitLabel }) => (
  <Card style={{ maxWidth: 400, width: '100%' }}>
    <Card.Header className="bg-primary text-white text-center">
      <h2 className="mb-0">{title}</h2>
    </Card.Header>
    <Card.Body>
      <Form onSubmit={onSubmit}>
        {children}
        <div className="d-grid mt-3">
          <Button type="submit" variant="primary">
            {submitLabel}
          </Button>
        </div>
      </Form>
    </Card.Body>
  </Card>
);

export default AuthForm;
