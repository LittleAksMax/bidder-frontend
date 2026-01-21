import { FC, useEffect, useState } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import { apiClient } from '../../api/ApiClient';
import { ChangeLogEntry, ChangeLogQuery, ChangeLogResult, Adgroup } from '../../api/types';

interface ChangeLogModalProps {
  show: boolean;
  onHide: () => void;
  adgroups: Adgroup[];
}

const getColor = (oldPrice: number, newPrice: number) => {
  if (newPrice > oldPrice) return 'text-success';
  if (newPrice < oldPrice) return 'text-danger';
  return '';
};

const getPrefix = (oldPrice: number, newPrice: number) => {
  if (newPrice > oldPrice) return '+';
  if (newPrice < oldPrice) return '-';
  return '';
};

const ChangeLogModal: FC<ChangeLogModalProps> = ({ show, onHide, adgroups }) => {
  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25); // Use 25 as a middle ground between 20 and 30
  const [days, setDays] = useState(30);
  const endTime = new Date().toISOString();
  const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  useEffect(() => {
    if (!show) return;
    const fetchLogs = async () => {
      // Collect all product IDs from all adgroups
      const productIds = adgroups.flatMap((a) => a.products.map((p) => p.id));
      const query: ChangeLogQuery = { startTime, endTime, page, pageSize };
      const result: ChangeLogResult = await apiClient.getChangeLogs(query);
      // Filter logs to only those for products in these adgroups
      const filtered = result.entries.filter((e) => productIds.includes(e.product_id));
      setLogs(filtered);
      setTotal(filtered.length);
    };
    fetchLogs();
    // eslint-disable-next-line
  }, [show, days, page, adgroups]);

  const totalPages = Math.ceil(total / pageSize);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Change Log</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex align-items-center mb-3">
          <Form.Label className="me-2 mb-0">Show changes from last</Form.Label>
          <Form.Control
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            style={{ width: 80 }}
          />
          <span className="ms-2">days</span>
        </div>
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Old Price</th>
              <th>New Price</th>
              <th>Time</th>
              <th>Policy</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{log.product_id}</td>
                <td>{log.old_price}</td>
                <td className={getColor(log.old_price, log.new_price)}>
                  {getPrefix(log.old_price, log.new_price)}
                  {log.new_price}
                </td>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.policy ? log.policy.name : <span className="text-muted">N/A</span>}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Page {page} of {totalPages || 1}
          </div>
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page <= 1}
              onClick={handlePrev}
              className="me-2"
            >
              Previous
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ChangeLogModal;
