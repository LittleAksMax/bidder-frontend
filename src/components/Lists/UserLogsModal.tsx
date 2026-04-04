import { FC, useEffect, useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import { apiClient } from '../../api/ApiClient';
import { UserLogResponse } from '../../api/logs.types';
import Loading from '../../pages/Loading';
import './UserLogsModal.css';

interface UserLogsModalProps {
  show: boolean;
  onHide: () => void;
  profileId: number | null;
  profileLabel: string | null;
}

const UserLogsModal: FC<UserLogsModalProps> = ({ show, onHide, profileId, profileLabel }) => {
  const [logs, setLogs] = useState<UserLogResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show) {
      return;
    }

    let isCancelled = false;

    const fetchLogs = async (): Promise<void> => {
      if (profileId === null) {
        setLogs([]);
        setTotalPages(0);
        return;
      }

      setLoading(true);
      const response = await apiClient.getUserLogs(profileId, page);
      if (isCancelled) {
        return;
      }

      setLogs(response.logs);
      setTotalPages(response.totalPages);
      setLoading(false);
    };

    void fetchLogs();

    return () => {
      isCancelled = true;
    };
  }, [show, profileId, page]);

  const safeTotalPages = Math.max(1, totalPages);
  const title = profileLabel ? `Logs for ${profileLabel}` : 'User Logs';

  return (
    <Modal show={show} onHide={onHide} size="lg" centered dialogClassName="user-logs-modal-dialog">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="user-logs-modal-body">
        {loading ? (
          <Loading className="user-logs-loading" />
        ) : (
          <>
            <div className="user-logs-table-wrapper">
              <Table bordered hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th className="user-logs-timestamp-col">Timestamp</th>
                    <th>Log</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((entry) => (
                      <tr key={`${entry.timestamp.toISOString()}-${entry.log}`}>
                        <td className="user-logs-timestamp-cell">
                          <code>{entry.timestamp.toLocaleString()}</code>
                        </td>
                        <td className="user-logs-log-cell">
                          <code>{entry.log}</code>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center text-muted">
                        No logs found for this profile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Page {page} of {safeTotalPages}
              </div>
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="me-2"
                >
                  Previous
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(safeTotalPages, prev + 1))}
                  disabled={page >= safeTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default UserLogsModal;
