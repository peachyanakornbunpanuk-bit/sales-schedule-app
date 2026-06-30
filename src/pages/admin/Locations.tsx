import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMockData } from '../../context/ApiDataContext';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

const Locations = () => {
  const { locations, addLocation } = useMockData();
  const { showToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    
    addLocation({ name, address });
    showToast('Location added successfully', 'success');
    setIsModalOpen(false);
    setName('');
    setAddress('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Location Management</h1>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {locations.map(loc => (
          <Link to={`/admin/locations/${loc.id}`} key={loc.id} className="glass-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>{loc.name}</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{loc.address}</p>
          </Link>
        ))}
        <div 
          className="glass-card" 
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderStyle: 'dashed', borderWidth: '2px' }}
        >
          <span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>+ Add Location</span>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Location">
        <form onSubmit={handleAddLocation}>
          <div className="form-group">
            <label className="form-label">Location Name</label>
            <input className="input-field" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Downtown Store" />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="input-field" value={address} onChange={e => setAddress(e.target.value)} required placeholder="123 Main St" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Location</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Locations;
