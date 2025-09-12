// admin-ui/src/components/StatusUpdateModal.jsx
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function StatusUpdateModal({ order, onClose, onUpdate }) {
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await ordersAPI.updateOrderStatus(order.id, {
        status,
        version: order.version,
      });

      onUpdate(response.data);
      addToast('Order status updated successfully', 'success');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to update status';
      addToast(message, 'error');

      if (error.response?.status === 409) {
        // Optimistic locking conflict - refresh the data
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Update Order Status</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status:{' '}
              <span className="font-semibold">{order.status}</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field"
              required
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            <p>Order ID: #{order.id}</p>
            <p>Version: {order.version}</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
