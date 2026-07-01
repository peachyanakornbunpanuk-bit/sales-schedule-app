import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMockData } from '../../context/ApiDataContext';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 11; // 11 + 1 Add button = 12 items in grid

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const paginatedLocations = filteredLocations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Location Management</h1>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search by name or address..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {paginatedLocations.map(loc => (
          <Link to={`/admin/locations/${loc.id}`} key={loc.id} className="glass-card" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>{loc.name}</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{loc.address}</p>
          </Link>
        ))}
        {currentPage === totalPages || filteredLocations.length === 0 ? (
          <div 
            className="glass-card" 
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderStyle: 'dashed', borderWidth: '2px' }}
          >
            <span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>+ Add Location</span>
          </div>
        ) : null}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
          <button 
            className="btn btn-outline" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            style={{ padding: '0.5rem' }}
          >
            <ChevronLeft size={20} />
          </button>
          <span style={{ color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages || 1}</span>
          <button 
            className="btn btn-outline" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            style={{ padding: '0.5rem' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

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
