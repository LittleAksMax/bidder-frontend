import { FC, useEffect, useMemo, useState } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import { apiClient } from '../../api/ApiClient';
import { ChangeLogEntry } from '../../api/types';
import './ChangeLogModal.css';

export type ChangeLogScope = 'seller' | 'profile' | 'campaign' | 'adgroup';

interface ChangeLogModalProps {
  show: boolean;
  onHide: () => void;
  scope: ChangeLogScope;
  sellerId: string | null;
  profileId: number | null;
  campaignId?: string | null;
  adgroupId?: string | null;
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

const getTitle = (scope: ChangeLogScope): string => {
  if (scope === 'seller') return 'Seller Change Log';
  if (scope === 'profile') return 'Profile Change Log';
  if (scope === 'campaign') return 'Campaign Change Log';
  return 'Ad Group Change Log';
};

const ChangeLogModal: FC<ChangeLogModalProps> = ({
  show,
  onHide,
  scope,
  sellerId,
  profileId,
  campaignId,
  adgroupId,
}) => {
  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);
  const pageSize = 25;

  useEffect(() => {
    if (!show) return;

    const fetchLogs = async () => {
      if (!sellerId) {
        setLogs([]);
        return;
      }

      if (profileId === null) {
        setLogs([]);
        return;
      }

      if (scope === 'profile') {
        setLogs(await apiClient.getProfileChangeLogs(profileId, days));
        return;
      }

      if (campaignId == null) {
        setLogs([]);
        return;
      }

      if (scope === 'campaign') {
        setLogs(await apiClient.getCampaignChangeLogs(profileId, campaignId, days));
        return;
      }

      if (adgroupId == null) {
        setLogs([]);
        return;
      }

      setLogs(await apiClient.getAdgroupChangeLogs(profileId, campaignId, adgroupId, days));
    };

    void fetchLogs();
  }, [show, days, scope, profileId, campaignId, adgroupId]);

  useEffect(() => {
    if (!show) return;
    setPage(1);
  }, [show, days, scope, sellerId, profileId, campaignId, adgroupId]);

  const total = logs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return logs.slice(start, start + pageSize);
  }, [logs, page]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{getTitle(scope)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex align-items-center mb-3">
          <Form.Label className="me-2 mb-0">Show changes from last</Form.Label>
          <Form.Control
            type="number"
            min={1}
            value={days}
            onChange={(e) => {
              const nextValue = Number(e.target.value);
              setDays(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1);
            }}
            className="change-log-days-input"
          />
          <span className="ms-2">days</span>
        </div>
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>Adgroup</th>
              <th>Old Price</th>
              <th>New Price</th>
              <th>Time</th>
              <th>Policy</th>
            </tr>
          </thead>
          <tbody>
            {pagedLogs.length > 0 ? (
              pagedLogs.map((log) => (
                <tr key={log.timestamp.toString() + log.adgroup.toString()}>
                  <td>{log.adgroup}</td>
                  <td>{log.oldPrice}</td>
                  <td className={getColor(log.oldPrice, log.newPrice)}>
                    {getPrefix(log.oldPrice, log.newPrice)}
                    {log.newPrice}
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.policyName}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  No change log entries found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Page {page} of {totalPages}
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
