'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '@/lib/api/client';
import { useRoleAccess } from '@/app/hooks/useRoleAccess';
import { useAuth } from '@/app/context/AuthContext';
import '@/styles/pages.css';

export const dynamic = 'force-dynamic';

export default function EventManagement() {
  // Allow all authenticated users to access events
  useRoleAccess(['admin', 'staff', 'user']);

  const { user } = useAuth();
  const isReadOnly = user?.role === 'user';

  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    date: '',
    location: '',
    capacity: '',
    description: '',
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch events with proper caching
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['events'],  // Fixed key - no timestamp
    queryFn: async () => {
      try {
        return await eventApi.getEvents({ limit: 100 });
      } catch (error) {
        console.error('❌ Failed to fetch events');
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,  // Keep data fresh for 5 minutes
    gcTime: 10 * 60 * 1000,    // Keep in cache for 10 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds when window is focused
    refetchOnWindowFocus: true, // Refetch when user returns to window
    retry: 2,
  });

  // Extract events safely
  const events = React.useMemo(() => {
    // Handle different response structures
    if (!response) {
      return [];
    }

    let data = null;

    // Path 1: response.data.data (Axios wrapped { success, data: [...], total, limit })
    if (response?.data?.data && Array.isArray(response.data.data)) {
      data = response.data.data;
    }
    // Path 2: response.data is the array directly ({ success, data: [...] } at top level)
    else if (response?.data && Array.isArray(response.data)) {
      data = response.data;
    }
    // Path 3: Check if response itself has a data property that's an array (unwrapped response)
    else if (response?.success === true && response?.data) {
      if (Array.isArray(response.data)) {
        data = response.data;
      }
    }
    // Path 4: response is directly an array
    else if (Array.isArray(response)) {
      data = response;
    }

    return Array.isArray(data) ? data : [];
  }, [response]);

  // Filter events by search term
  const filteredEvents = React.useMemo(() => {
    if (!searchTerm) return events;

    return events.filter(event =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  // Create Event Mutation
  const createMutation = useMutation({
    mutationFn: eventApi.createEvent,
    onSuccess: () => {
      alert('✅ Event created successfully');
      setFormData({
        title: '',
        type: '',
        date: '',
        location: '',
        capacity: '',
        description: '',
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      refetch();
    },
    onError: (error) => {
      alert('❌ Error creating event: ' + error.message);
    },
  });

  // Update Event Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => eventApi.updateEvent(id, data),
    onSuccess: () => {
      alert('✅ Event updated successfully');
      setShowEditModal(false);
      setEditingEvent(null);
      queryClient.invalidateQueries({ queryKey: ['events'] });
      refetch();
    },
    onError: (error) => {
      alert('❌ Error updating event: ' + error.message);
    },
  });

  // Delete Event Mutation
  const deleteMutation = useMutation({
    mutationFn: eventApi.deleteEvent,
    onSuccess: () => {
      alert('✅ Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      refetch();
    },
    onError: (error) => {
      alert('❌ Error deleting event: ' + error.message);
    },
  });

  // Handle form submission for create
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const eventData = {
      title: formData.title,
      type: formData.type,
      date: new Date(formData.date).toISOString(),
      location: formData.location,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      description: formData.description,
      status: 'Scheduled',
    };
    createMutation.mutate(eventData);
  };

  // Handle edit
  const handleEditClick = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      type: event.type,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      location: event.location || '',
      capacity: event.capacity || '',
      description: event.description || '',
    });
    setShowEditModal(true);
  };

  // Handle update submit
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const eventData = {
      title: formData.title,
      type: formData.type,
      date: new Date(formData.date).toISOString(),
      location: formData.location,
      capacity: formData.capacity ? parseInt(formData.capacity) : null,
      description: formData.description,
      status: editingEvent.status,
    };
    updateMutation.mutate({ id: editingEvent.id, data: eventData });
  };

  // Handle delete
  const handleDeleteClick = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(eventId);
    }
  };

  return (
    <div className="page event-management">
      <h1>📅 Event Management</h1>

      {/* Create Event Form - Only for Admin and Staff */}
      {!isReadOnly && (
      <div className="form-section">
        <h2>Create New Event</h2>
        <form onSubmit={handleCreateSubmit} className="form">
          <div className="form-row">
            <input
              placeholder="Event Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <input
              placeholder="Event Type (Service, Meeting, Social, etc.)"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
            <input
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              placeholder="Capacity (leave empty for unlimited)"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />
          </div>
          <textarea
            placeholder="Event Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? '⏳ Creating...' : '➕ Create Event'}
          </button>
        </form>
      </div>
      )}

      {/* Events List Section */}
      <div className="list-section">
        <h2>
          📋 Events
          {events.length > 0 && ` (${filteredEvents.length} of ${events.length})`}
        </h2>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search events by title, type, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            ⏳ Loading events...
          </p>
        )}

        {/* Error State */}
        {error && (
          <p style={{ textAlign: 'center', padding: '20px', color: '#dc2626' }}>
            ❌ Error loading events: {error.message}
          </p>
        )}

        {/* Events Grid */}
        {!isLoading && (
          <div className="events-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="event-card"
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Event Header */}
                  <div style={{ marginBottom: '12px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
                      {event.title}
                    </h3>
                    <span style={{
                      display: 'inline-block',
                      background: event.status === 'Scheduled' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.85em',
                      fontWeight: '600'
                    }}>
                      {event.status || 'Scheduled'}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div style={{ fontSize: '0.95em', color: '#374151', lineHeight: '1.6' }}>
                    <p style={{ margin: '8px 0' }}>
                      <strong>📌 Type:</strong> {event.type || '-'}
                    </p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>📅 Date:</strong> {event.date ? new Date(event.date).toLocaleString() : 'TBA'}
                    </p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>📍 Location:</strong> {event.location || 'TBA'}
                    </p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>👥 Capacity:</strong> {event.capacity ? `${event.capacity} people` : 'Unlimited'}
                    </p>
                    <p style={{ margin: '8px 0' }}>
                      <strong>✓ Attendees:</strong> {event.attendees || 0}
                    </p>
                    {event.description && (
                      <p style={{ margin: '8px 0', fontStyle: 'italic', color: '#666' }}>
                        <strong>📝 Description:</strong> {event.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons - Only for Admin and Staff */}
                  {!isReadOnly && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <button
                      onClick={() => handleEditClick(event)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                        fontWeight: '500'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(event.id)}
                      disabled={deleteMutation.isPending}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                        fontSize: '0.9em',
                        fontWeight: '500',
                        opacity: deleteMutation.isPending ? 0.6 : 1
                      }}
                    >
                      {deleteMutation.isPending ? '⏳ Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999'
              }}>
                <p style={{ fontSize: '1.1em' }}>
                  {searchTerm ? '🔍 No events match your search' : '📭 No events yet. Create one to get started!'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0 }}>✏️ Edit Event</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEvent(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="form">
              <div className="form-row">
                <input
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <input
                  placeholder="Event Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="form-row">
                <input
                  type="number"
                  placeholder="Capacity"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <textarea
                placeholder="Event Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateMutation.isPending}
                  style={{ flex: 1 }}
                >
                  {updateMutation.isPending ? '⏳ Updating...' : '💾 Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEvent(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
