import { FC, useEffect, useMemo, useState } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import { apiClient } from '../../api/ApiClient';
import { BidResponse } from '../../api/types';
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
  adgroupNamesById?: Record<string, string> | null;
}

const getNewBidClassName = (oldPrice: number, newPrice: number, threshold: number): string => {
  const difference = newPrice - oldPrice;

  if (difference >= threshold) return 'change-log-bid-value change-log-bid-value-up';
  if (difference <= -threshold) return 'change-log-bid-value change-log-bid-value-down';
  return 'change-log-bid-value change-log-bid-value-neutral';
};

const getPrefix = (oldPrice: number, newPrice: number) => {
  if (newPrice > oldPrice) return '+';
  if (newPrice < oldPrice) return '-';
  return '';
};

const formatBidValue = (value: number): string => value.toFixed(2);

const getTitle = (scope: ChangeLogScope): string => {
  if (scope === 'seller') return 'Seller Change Log';
  if (scope === 'profile') return 'Profile Change Log';
  if (scope === 'campaign') return 'Campaign Change Log';
  return 'Ad Group Change Log';
};

const getAdgroupLabel = (
  adgroupId: string,
  adgroupNamesById?: Record<string, string> | null,
): string => {
  const adgroupName = adgroupNamesById?.[adgroupId];
  return adgroupName ?? 'Unknown Ad Group';
};

const ChangeLogModal: FC<ChangeLogModalProps> = ({
  show,
  onHide,
  scope,
  sellerId,
  profileId,
  campaignId,
  adgroupId,
  adgroupNamesById,
}) => {
  const [logs, setLogs] = useState<BidResponse[]>([]);
  const [page, setPage] = useState(1);
  const [days, setDays] = useState(30);
  const [bidColourThreshold, setBidColourThreshold] = useState(0.01);
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
              <th>Live</th>
            </tr>
          </thead>
          <tbody>
            {pagedLogs.length > 0 ? (
              pagedLogs.map((log) => (
                <tr key={`${log.changeDate.toISOString()}-${log.adgroupId}`}>
                  <td>{getAdgroupLabel(log.adgroupId, adgroupNamesById)}</td>
                  <td>
                    <span className="change-log-bid-value">{formatBidValue(log.oldPrice)}</span>
                  </td>
                  <td>
                    <span
                      className={getNewBidClassName(log.oldPrice, log.newPrice, bidColourThreshold)}
                    >
                      {getPrefix(log.oldPrice, log.newPrice)}
                      {formatBidValue(log.newPrice)}
                    </span>
                  </td>
                  <td>{new Date(log.changeDate).toLocaleString()}</td>
                  <td>{log.isLive ? 'Yes' : 'No'}</td>
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
        <div className="change-log-threshold-slider">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="mb-0">Bid Colour Threshold</Form.Label>
            <span className="change-log-threshold-value">{bidColourThreshold.toFixed(2)}</span>
          </div>
          <Form.Range
            min={0.01}
            max={0.5}
            step={0.01}
            value={bidColourThreshold}
            onChange={(event) => {
              const nextThreshold = Number.parseFloat(event.target.value);
              setBidColourThreshold(Number.isFinite(nextThreshold) ? nextThreshold : 0);
            }}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ChangeLogModal;
