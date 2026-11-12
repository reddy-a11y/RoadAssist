import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Car, Plus, Trash2, Edit3, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';

const VehicleManagementPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form states
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2023');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [color, setColor] = useState('White');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicleTypes = ['Hatchback', 'Sedan', 'SUV', 'Motorcycle', 'Commercial/Van'];

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/vehicles');
      if (res.success) {
        setVehicles(res.vehicles || []);
      }
    } catch (err) {
      toast.error('Failed to load vehicles: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setMake('');
    setModel('');
    setYear('2023');
    setRegistrationNumber('');
    setVehicleType('Sedan');
    setColor('White');
    setIsDefault(vehicles.length === 0);
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVehicle(v);
    setMake(v.make);
    setModel(v.model);
    setYear(v.year.toString());
    setRegistrationNumber(v.registration_number);
    setVehicleType(v.vehicle_type);
    setColor(v.color || 'White');
    setIsDefault(Boolean(v.is_default));
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!make.trim() || !model.trim() || !registrationNumber.trim()) {
      toast.error('Please complete make, model, and registration number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year, 10),
        registrationNumber: registrationNumber.trim().toUpperCase(),
        vehicleType,
        color: color.trim(),
        isDefault
      };

      if (editingVehicle) {
        const res = await api.put(`/vehicles/${editingVehicle.id}`, payload);
        if (res.success) {
          toast.success('Vehicle updated successfully!');
        }
      } else {
        const res = await api.post('/vehicles', payload);
        if (res.success) {
          toast.success('Vehicle added to your garage!');
        }
      }

      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle removed.');
      fetchVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.patch(`/vehicles/${id}/default`);
      toast.success('Default vehicle set.');
      fetchVehicles();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">My Saved Vehicles</h2>
          <p className="text-xs text-slate-500">
            Keep your vehicles registered for fast 1-click roadside dispatch
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading garage vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 space-y-4">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-navy-900">Your Garage is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your car, motorcycle, or commercial van so rescue mechanics know what spare parts and tools to bring.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-bold"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={`bg-white rounded-2xl p-6 border shadow-sm transition-all relative flex flex-col justify-between ${
                v.is_default ? 'border-brand-blue ring-1 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    {v.vehicle_type}
                  </span>
                  {v.is_default ? (
                    <span className="text-[11px] font-bold text-brand-blue flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Primary
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(v.id)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-brand-blue"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                <div className="w-12 h-12 rounded-xl bg-slate-50 text-navy-900 flex items-center justify-center mb-3">
                  <Car className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-navy-900">
                  {v.make} {v.model}
                </h3>
                <div className="text-xs font-mono font-bold text-brand-blue mt-1">
                  {v.registration_number}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Year: {v.year} • Color: {v.color || 'Silver'}
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(v)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  title="Edit Vehicle"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Delete Vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-navy-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingVehicle ? 'Edit Vehicle Details' : 'Add Vehicle to Garage'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Manufacturer / Make
                  </label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Hyundai"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Creta SX"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registration Plate
                  </label>
                  <input
                    type="text"
                    required
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="TS09EA4589"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year of Manufacture
                  </label>
                  <input
                    type="number"
                    required
                    min={1990}
                    max={2030}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    {vehicleTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. White"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded text-brand-blue focus:ring-brand-blue"
                />
                <span>Set as primary default vehicle</span>
              </label>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VehicleManagementPage;
