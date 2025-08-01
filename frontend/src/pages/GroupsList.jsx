import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupInvitations from '../components/GroupInvitations';

export default function GroupsList() {
  // --- Estados principales ---
  const [groups, setGroups] = useState([]);      // Lista de grupos del usuario
  const [name, setName] = useState('');          // Nombre para crear nuevo grupo
  const [desc, setDesc] = useState('');          // Descripción para crear nuevo grupo
  const [error, setError] = useState(null);      // Mensaje de error
  const navigate = useNavigate();                // Para redireccionar

  // --- Cargar grupos al montar el componente ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/groups', { headers: { Authorization: `Bearer ${token}` } }) // Llama al backend para traer los grupos
      .then(r => r.json())
      .then(setGroups);
  }, []);

  // --- Crear un nuevo grupo ---
  const handleCreate = async e => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    try {
      // Llama al backend para crear el grupo
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, description: desc })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo crear el grupo');
      // Redirige al detalle del grupo recién creado
      navigate(`/groups/${data.groupId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Eliminar un grupo ---
  const handleDelete = async (groupId) => {
    if (!window.confirm('¿Eliminar este grupo? Esta acción es irreversible.')) return;
    const token = localStorage.getItem('token');
    try {
      // Llama al backend para eliminar el grupo
      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar el grupo');
      // Actualiza la lista de grupos en el frontend
      setGroups(groups => groups.filter(g => g.id !== groupId));
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Render principal ---
  return (
    <div>
      <h2 className="mb-4 text-center">Mis grupos</h2>
      {/* Muestra invitaciones pendientes a grupos */}
      <GroupInvitations />
      {/* Formulario para crear un nuevo grupo */}
      <form className="mb-4" onSubmit={handleCreate}>
        <div className="row g-2 align-items-end">
          <div className="col">
            <input
              className="form-control"
              placeholder="Nombre del grupo"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="col">
            <input
              className="form-control"
              placeholder="Descripción"
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
          <div className="col-auto">
            <button className="btn btn-primary" type="submit">Crear grupo</button>
          </div>
        </div>
        {error && <div className="alert alert-danger mt-2">{error}</div>}
      </form>
      {/* Lista de grupos */}
      <ul className="list-group">
        {groups.map(g => (
          <li key={g.id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{g.name}</span>
            <span>
              {/* Botón para ver el detalle del grupo */}
              <button
                className="btn btn-outline-info btn-sm me-2"
                onClick={() => navigate(`/groups/${g.id}`)}
              >
                Ver
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDelete(g.id)}
              >
                Eliminar
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}