
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/AdminPanel.css';

import { UserMap } from '../components/UserMap';
import { TelemetryChart } from '../components/TelemetryChart';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

import logoTesseracto from '../assets/TESSERACTOLOGONEGROp.png';

/* =========================================================
   TIPOS
   ========================================================= */

type UserStatus = 'Activo' | 'Inactivo' | 'Bloqueado';

type UtrStatus = 'Activa' | 'Advertencia' | 'Inactiva';

interface AdminUser {
  id: number;
  username: string;
  role: 'user';
  estado: UserStatus;
  created_at: string;
  location: string;
  assigned_utr_id: number | null;
}

interface AdminUtr {
  id: number;

  nsut: string;
  nsue: string;
  nsm: string;

  estado: UtrStatus;

  flujo: string;
  acumulado: string;
  velocidad: string;
  direccion: string;

  ker: string;

  actualizacion: string;

  latitude: number;
  longitude: number;

  is_active: boolean;

  assigned_user_id: number | null;
}

interface HistoryItem {
  id: number;
  date: string;
  action: string;
  target: string;
  user: string;
}

interface TelemetryPoint {
  timestamp: string;
  flow_instant: number;
  flow_accumulated: number;
  flow_velocity: number;
}

/* =========================================================
   PANEL ADMIN
   ========================================================= */

export const AdminPanel = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  /* =========================================================
     TODO BACKEND - DATOS DEL ADMIN
     =========================================================

     Actualmente este panel utiliza datos simulados.

     En producción, el backend debe identificar al admin mediante
     su JWT y regresar ÚNICAMENTE información de su empresa.

     Endpoints sugeridos:

     GET    /api/admin/dashboard
     GET    /api/admin/users
     POST   /api/admin/users
     PUT    /api/admin/users/:id
     DELETE /api/admin/users/:id

     GET    /api/admin/utrs

     PATCH  /api/admin/utrs/:id/assign-user

     GET    /api/admin/history

     IMPORTANTE:

     El frontend NO debe decidir qué empresa puede consultar.

     Esa validación debe realizarla el backend utilizando:

     user.client_id

     o la relación equivalente definida en la base de datos.
  */

  /* =========================================================
     USUARIOS MOCK
     ========================================================= */

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: 1,
      username: 'cliente_puebla',
      role: 'user',
      estado: 'Activo',
      created_at: '2026-07-01',
      location: 'Puebla, Pue.',
      assigned_utr_id: 1,
    },

    {
      id: 2,
      username: 'cliente_cdmx',
      role: 'user',
      estado: 'Activo',
      created_at: '2026-07-04',
      location: 'CDMX',
      assigned_utr_id: 2,
    },

    {
      id: 3,
      username: 'cliente_morelos',
      role: 'user',
      estado: 'Bloqueado',
      created_at: '2026-07-07',
      location: 'Cuernavaca, Mor.',
      assigned_utr_id: null,
    },
  ]);

  /* =========================================================
     UTRs MOCK
     ========================================================= */

  const [utrs, setUtrs] = useState<AdminUtr[]>([
    {
      id: 1,

      nsut: 'UTR-001',
      nsue: 'NSUE-001',
      nsm: 'NSM-001',

      estado: 'Activa',

      flujo: '25.6 L/s',
      acumulado: '12,450 L',
      velocidad: '1.8 m/s',
      direccion: 'Normal',

      ker: 'OK',

      actualizacion: 'Hace 2 min',

      latitude: 19.0414,
      longitude: -98.2063,

      is_active: true,

      assigned_user_id: 1,
    },

    {
      id: 2,

      nsut: 'UTR-002',
      nsue: 'NSUE-002',
      nsm: 'NSM-002',

      estado: 'Advertencia',

      flujo: '12.4 L/s',
      acumulado: '8,120 L',
      velocidad: '0.9 m/s',
      direccion: 'Normal',

      ker: 'WARNING',

      actualizacion: 'Hace 8 min',

      latitude: 19.4326,
      longitude: -99.1332,

      is_active: true,

      assigned_user_id: 2,
    },

    {
      id: 3,

      nsut: 'UTR-003',
      nsue: 'NSUE-003',
      nsm: 'NSM-003',

      estado: 'Inactiva',

      flujo: '0.0 L/s',
      acumulado: '0 L',
      velocidad: '0.0 m/s',
      direccion: 'Sin flujo',

      ker: 'SIN DATOS',

      actualizacion: 'Hace 1 h',

      latitude: 18.9242,
      longitude: -99.2216,

      is_active: false,

      assigned_user_id: null,
    },
  ]);

  /* =========================================================
     HISTORIAL MOCK
     ========================================================= */

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 1,
      date: '2026-07-08 10:30',
      action: 'Asignación de UTR',
      target: 'UTR-001 asignada a cliente_puebla',
      user: 'admin_empresa',
    },

    {
      id: 2,
      date: '2026-07-08 11:15',
      action: 'Cambio de estado',
      target: 'cliente_morelos bloqueado',
      user: 'admin_empresa',
    },
  ]);

  /* =========================================================
     ESTADOS DE SELECCIÓN
     ========================================================= */

  const [selectedUtrId, setSelectedUtrId] = useState<number>(
    utrs[0]?.id ?? 0
  );

  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);

  const [selectedAssignUtr, setSelectedAssignUtr] =
    useState<AdminUtr | null>(null);

  /* =========================================================
     BUSCADORES
     ========================================================= */

  const [userSearch, setUserSearch] = useState('');

  const [utrSearch, setUtrSearch] = useState('');

  const [historySearch, setHistorySearch] = useState('');

  /* =========================================================
     MODALES
     ========================================================= */

  const [showCreateUser, setShowCreateUser] = useState(false);

  const [showEditUser, setShowEditUser] = useState(false);

  const [showAssignUtr, setShowAssignUtr] = useState(false);

  /* =========================================================
     FORMULARIOS
     ========================================================= */

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    location: '',
  });

  const [editUser, setEditUser] = useState({
    username: '',
    password: '',
    location: '',
    estado: 'Activo' as UserStatus,
  });

  const [assignUserId, setAssignUserId] = useState('');

  /* =========================================================
     TELEMETRÍA
     =========================================================

     TODO BACKEND:

     Reemplazar este arreglo por datos reales.

     Endpoint sugerido:

     GET /api/admin/utr/:id/telemetry/history

     El ID debe corresponder a selectedUtr.id.

     Para tiempo real se puede utilizar:

     - WebSocket
     - Server-Sent Events
     - Polling
  */

  const realTimeTelemetryData: TelemetryPoint[] = [];

  /* =========================================================
     UTR SELECCIONADA
     ========================================================= */

  const selectedUtr = useMemo(() => {
    return (
      utrs.find((utr) => utr.id === selectedUtrId) ||
      utrs[0] ||
      null
    );
  }, [utrs, selectedUtrId]);

  /* =========================================================
     FUNCIONES AUXILIARES
     ========================================================= */

  const getAssignedUser = (utr: AdminUtr) => {
    return adminUsers.find(
      (adminUser) =>
        adminUser.id === utr.assigned_user_id
    );
  };

  const getUserStatusClass = (estado: UserStatus) => {
    if (estado === 'Activo') {
      return 'active';
    }

    if (estado === 'Bloqueado') {
      return 'locked';
    }

    return 'inactive';
  };

  /* =========================================================
     FILTRO DE USUARIOS
     ========================================================= */

  const filteredUsers = useMemo(() => {
    const query =
      userSearch.toLowerCase().trim();

    return adminUsers.filter((adminUser) => {
      return (
        adminUser.username
          .toLowerCase()
          .includes(query) ||

        adminUser.location
          .toLowerCase()
          .includes(query) ||

        String(adminUser.id)
          .includes(query)
      );
    });
  }, [adminUsers, userSearch]);

  /* =========================================================
     FILTRO DE UTRs
     ========================================================= */

  const filteredUtrs = useMemo(() => {
    const query =
      utrSearch.toLowerCase().trim();

    return utrs.filter((utr) => {
      return (
        utr.nsut
          .toLowerCase()
          .includes(query) ||

        utr.nsue
          .toLowerCase()
          .includes(query) ||

        utr.nsm
          .toLowerCase()
          .includes(query) ||

        String(utr.id)
          .includes(query)
      );
    });
  }, [utrs, utrSearch]);

  /* =========================================================
     FILTRO DE HISTORIAL
     ========================================================= */

  const filteredHistory = useMemo(() => {
    const query =
      historySearch.toLowerCase().trim();

    return history.filter((item) => {
      return (
        item.date
          .toLowerCase()
          .includes(query) ||

        item.action
          .toLowerCase()
          .includes(query) ||

        item.target
          .toLowerCase()
          .includes(query) ||

        item.user
          .toLowerCase()
          .includes(query) ||

        String(item.id)
          .includes(query)
      );
    });
  }, [history, historySearch]);

  /* =========================================================
     ESTADÍSTICAS DEL DASHBOARD
     ========================================================= */

  const activeUsers = adminUsers.filter(
    (adminUser) =>
      adminUser.estado === 'Activo'
  ).length;

  const usersWithoutUtr = adminUsers.filter(
    (adminUser) =>
      adminUser.assigned_utr_id === null
  ).length;

  const activeUtrs = utrs.filter(
    (utr) =>
      utr.estado === 'Activa'
  ).length;

  const warningUtrs = utrs.filter(
    (utr) =>
      utr.estado === 'Advertencia'
  ).length;

  const inactiveUtrs = utrs.filter(
    (utr) =>
      utr.estado === 'Inactiva'
  ).length;

  const assignedUtrs = utrs.filter(
    (utr) =>
      utr.assigned_user_id !== null
  ).length;

  /* =========================================================
     CERRAR SESIÓN
     ========================================================= */

  const handleLogout = () => {
    logout();

    navigate(ROUTES.LOGIN);
  };

  /* =========================================================
     REGISTRAR HISTORIAL
     ========================================================= */

  const addHistory = (
    action: string,
    target: string
  ) => {
    setHistory((prev) => {
      const nextId =
        Math.max(
          0,
          ...prev.map((item) => item.id)
        ) + 1;

      const newHistory: HistoryItem = {
        id: nextId,

        date:
          new Date().toLocaleString('es-MX'),

        action,

        target,

        user:
          user?.username || 'admin_empresa',
      };

      return [
        newHistory,
        ...prev,
      ];
    });
  };

  /* =========================================================
     CREAR USUARIO
     ========================================================= */

  const handleCreateUser = (
    event: FormEvent
  ) => {
    event.preventDefault();

    const cleanUsername =
      newUser.username.trim();

    const cleanLocation =
      newUser.location.trim();

    const usernameExists =
      adminUsers.some(
        (adminUser) =>
          adminUser.username
            .trim()
            .toLowerCase() ===
          cleanUsername.toLowerCase()
      );

    if (usernameExists) {
      alert(
        'Ese nombre de usuario ya existe.'
      );

      return;
    }

    if (cleanUsername.length < 3) {
      alert(
        'El nombre de usuario debe tener al menos 3 caracteres.'
      );

      return;
    }

    if (cleanUsername.length > 40) {
      alert(
        'El nombre de usuario no debe superar 40 caracteres.'
      );

      return;
    }

    if (cleanLocation.length > 80) {
      alert(
        'La ubicación no debe superar 80 caracteres.'
      );

      return;
    }

    const nextUserId =
      Math.max(
        0,
        ...adminUsers.map(
          (adminUser) => adminUser.id
        )
      ) + 1;

    const userToCreate: AdminUser = {
      id: nextUserId,

      username: cleanUsername,

      role: 'user',

      estado: 'Activo',

      created_at:
        new Date()
          .toISOString()
          .split('T')[0],

      location:
        cleanLocation || 'Sin ubicación',

      assigned_utr_id: null,
    };

    /*
      TODO BACKEND:

      Actualmente el usuario se agrega únicamente
      al estado local.

      Reemplazar por:

      POST /api/admin/users

      El backend debe:

      - Validar username único.
      - Hashear password.
      - Crear el usuario.
      - Asociarlo con client_id del admin.
      - Regresar el usuario creado.
    */

    setAdminUsers((prev) => [
      userToCreate,
      ...prev,
    ]);

    addHistory(
      'Creación de usuario',
      `Usuario ${cleanUsername} creado`
    );

    setNewUser({
      username: '',
      password: '',
      location: '',
    });

    setShowCreateUser(false);
  };

  /* =========================================================
     ABRIR CONFIGURACIÓN DE USUARIO
     ========================================================= */

  const openEditUser = (
    adminUser: AdminUser
  ) => {
    setSelectedUser(adminUser);

    setEditUser({
      username: adminUser.username,
      password: '',
      location: adminUser.location,
      estado: adminUser.estado,
    });

    setShowEditUser(true);
  };

  /* =========================================================
     ACTUALIZAR USUARIO
     ========================================================= */

  const handleUpdateUser = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!selectedUser) {
      return;
    }

    const cleanUsername =
      editUser.username.trim();

    const cleanLocation =
      editUser.location.trim();

    const usernameExists =
      adminUsers.some(
        (adminUser) =>
          adminUser.id !== selectedUser.id &&

          adminUser.username
            .trim()
            .toLowerCase() ===
          cleanUsername.toLowerCase()
      );

    if (usernameExists) {
      alert(
        'Ese nombre de usuario ya pertenece a otro usuario.'
      );

      return;
    }

    if (cleanUsername.length < 3) {
      alert(
        'El nombre de usuario debe tener al menos 3 caracteres.'
      );

      return;
    }

    if (cleanUsername.length > 40) {
      alert(
        'El nombre de usuario no debe superar 40 caracteres.'
      );

      return;
    }

    if (cleanLocation.length > 80) {
      alert(
        'La ubicación no debe superar 80 caracteres.'
      );

      return;
    }

    /*
      TODO BACKEND:

      Reemplazar por:

      PUT /api/admin/users/:id

      body sugerido:

      {
        username,
        password?,
        location,
        estado
      }

      Si password está vacío, el backend NO debe
      modificar la contraseña actual.
    */

    setAdminUsers((prev) =>
      prev.map((adminUser) =>
        adminUser.id === selectedUser.id
          ? {
              ...adminUser,

              username: cleanUsername,

              location:
                cleanLocation || 'Sin ubicación',

              estado: editUser.estado,
            }
          : adminUser
      )
    );

    addHistory(
      'Configuración de usuario',

      `Usuario ${cleanUsername} actualizado`
    );

    setShowEditUser(false);

    setSelectedUser(null);
  };

  /* =========================================================
     ELIMINAR USUARIO
     ========================================================= */

  const handleDeleteUser = (
    adminUser: AdminUser
  ) => {
    const confirmDelete =
      window.confirm(
        `¿Seguro que deseas borrar a ${adminUser.username}?`
      );

    if (!confirmDelete) {
      return;
    }

    /*
      TODO BACKEND:

      Reemplazar por:

      DELETE /api/admin/users/:id

      El backend debe verificar que el admin
      tenga permiso sobre ese usuario.
    */

    setAdminUsers((prev) =>
      prev.filter(
        (item) =>
          item.id !== adminUser.id
      )
    );

    /*
      Cuando se elimina el usuario,
      la UTR queda sin asignación.
    */

    setUtrs((prev) =>
      prev.map((utr) =>
        utr.assigned_user_id === adminUser.id
          ? {
              ...utr,
              assigned_user_id: null,
            }
          : utr
      )
    );

    addHistory(
      'Eliminación de usuario',

      `Usuario ${adminUser.username} eliminado`
    );
  };

  /* =========================================================
     ABRIR ASIGNACIÓN DE UTR
     ========================================================= */

  const openAssignUtr = (
    utr: AdminUtr
  ) => {
    setSelectedAssignUtr(utr);

    setAssignUserId(
      utr.assigned_user_id
        ? String(utr.assigned_user_id)
        : ''
    );

    setShowAssignUtr(true);
  };

  /* =========================================================
     ASIGNAR UTR
     ========================================================= */

  const handleAssignUtr = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!selectedAssignUtr) {
      return;
    }

    const userId =
      assignUserId
        ? Number(assignUserId)
        : null;

    const assignedUser =
      adminUsers.find(
        (adminUser) =>
          adminUser.id === userId
      );

    /*
      TODO BACKEND:

      Reemplazar por:

      PATCH /api/admin/utrs/:id/assign-user

      body:

      {
        user_id: userId
      }

      El backend debe validar:

      - UTR pertenece a la empresa.
      - Usuario pertenece a la empresa.
      - Relación permitida.
      - Reglas de una UTR por usuario si aplican.
    */

    setUtrs((prev) =>
      prev.map((utr) => {
        /*
          La UTR seleccionada recibe
          el nuevo usuario.
        */

        if (
          utr.id === selectedAssignUtr.id
        ) {
          return {
            ...utr,

            assigned_user_id: userId,
          };
        }

        /*
          Si el nuevo usuario ya tenía otra UTR,
          su anterior UTR queda sin asignar.

          Esto mantiene el modelo actual:
          UN USUARIO -> UNA UTR.
        */

        if (
          userId !== null &&
          utr.assigned_user_id === userId
        ) {
          return {
            ...utr,

            assigned_user_id: null,
          };
        }

        return utr;
      })
    );

    setAdminUsers((prev) =>
      prev.map((adminUser) => {
        /*
          Quitar la UTR al usuario anterior.
        */

        if (
          adminUser.assigned_utr_id ===
          selectedAssignUtr.id
        ) {
          return {
            ...adminUser,

            assigned_utr_id: null,
          };
        }

        /*
          Asignar la UTR al nuevo usuario.
        */

        if (
          adminUser.id === userId
        ) {
          return {
            ...adminUser,

            assigned_utr_id:
              selectedAssignUtr.id,
          };
        }

        return adminUser;
      })
    );

    addHistory(
      'Asignación de UTR',

      `${selectedAssignUtr.nsut} asignada a ${
        assignedUser?.username ||
        'ningún usuario'
      }`
    );

    setSelectedUtrId(
      selectedAssignUtr.id
    );

    setShowAssignUtr(false);

    setSelectedAssignUtr(null);
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <main className="admin-page">
      <div className="admin-bg-grid"></div>

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">
            <img
              src={logoTesseracto}
              alt="Logo Tesseracto"
            />
          </div>

          <div>
            <h2>Tesseracto</h2>

            <p>Administración</p>
          </div>
        </div>

        <div className="admin-nav-label">
          Empresa
        </div>

        <nav>
          <a
            href="#resumen"
            className="active"
          >
            <span></span>
            Resumen
          </a>

          <a href="#operacion">
            <span></span>
            Operación
          </a>

          <a href="#usuarios">
            <span></span>
            Usuarios
          </a>

          <a href="#inventario">
            <span></span>
            Inventario
          </a>

          <a href="#graficas">
            <span></span>
            Telemetría
          </a>

          <a href="#historial">
            <span></span>
            Historial
          </a>
        </nav>

        <div className="admin-session">
          <span>Sesión administrativa</span>

          <strong>
            {user?.username || 'Admin empresa'}
          </strong>

          <small>
            Control de empresa
          </small>
        </div>
      </aside>

      {/* =====================================================
          CONTENIDO
          ===================================================== */}

      <section className="admin-content">
        {/* ===================================================
            HEADER
            =================================================== */}

        <header className="admin-header">
          <div>
            <span className="admin-kicker">
              Centro de administración
            </span>

            <h1>
              Control de tu empresa
            </h1>

            <p>
              Administra usuarios, revisa equipos y consulta
              el estado operativo de las UTRs asignadas.
            </p>
          </div>

          <button
            className="admin-logout-button"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="admin-logout-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M10 17L15 12L10 7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M15 12H3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <path
                  d="M14 4H18C19.6569 4 21 5.34315 21 7V17C21 18.6569 19.6569 20 18 20H14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <span className="admin-logout-text">
              <small>Finalizar</small>

              <strong>
                Cerrar sesión
              </strong>
            </span>
          </button>
        </header>

        {/* ===================================================
            RESUMEN
            =================================================== */}

        <section
          id="resumen"
          className="admin-overview"
        >
          <div className="admin-overview-copy">
            <div className="admin-overview-state">
              <span className="admin-live-dot"></span>

              <strong>
                Operación disponible
              </strong>
            </div>

            <span className="admin-overview-label">
              Estado de la empresa
            </span>

            <h2>
              Todo lo importante,
              en un solo lugar.
            </h2>

            <p>
              Actualmente tienes{' '}
              <strong>{activeUsers} usuarios activos</strong>{' '}
              y{' '}
              <strong>{activeUtrs} UTRs operando</strong>.
            </p>
          </div>

          <div className="admin-overview-stats">
            <div>
              <span>Usuarios</span>

              <strong>
                {adminUsers.length}
              </strong>

              <small>
                {usersWithoutUtr} sin UTR
              </small>
            </div>

            <div>
              <span>UTRs</span>

              <strong>
                {utrs.length}
              </strong>

              <small>
                {assignedUtrs} asignadas
              </small>
            </div>

            <div>
              <span>Advertencias</span>

              <strong>
                {warningUtrs}
              </strong>

              <small>
                Requieren revisión
              </small>
            </div>

            <div>
              <span>Inactivas</span>

              <strong>
                {inactiveUtrs}
              </strong>

              <small>
                Sin comunicación
              </small>
            </div>
          </div>
        </section>

        {/* ===================================================
            OPERACIÓN
            =================================================== */}

        <section
          id="operacion"
          className="admin-section"
        >
          <div className="admin-section-heading">
            <div>
              <span>Operación</span>

              <h2>
                Estado de las UTRs
              </h2>
            </div>

            <p>
              Selecciona un equipo para consultar
              su información actual.
            </p>
          </div>

          {selectedUtr ? (
            <div className="admin-operation-layout">
              <article
                id="mapa"
                className="admin-map-panel"
              >
                <div className="admin-panel-header">
                  <div>
                    <span>Mapa operativo</span>

                    <h3>
                      Equipos de la empresa
                    </h3>
                  </div>

                  <strong>
                    {activeUtrs} activas
                  </strong>
                </div>

                <UserMap utrs={utrs} />

                {/*
                  TODO COMPONENTE USERMAP:

                  Actualmente la selección se realiza mediante
                  los botones inferiores.

                  Para seleccionar haciendo clic directamente
                  sobre un marcador del mapa, agregar posteriormente
                  una prop al componente UserMap:

                  onSelectUtr={(utr) => setSelectedUtrId(utr.id)}

                  Esto requiere modificar UserMap.tsx.
                */}

                <div className="admin-map-selector">
                  {utrs.map((utr) => (
                    <button
                      key={utr.id}
                      className={
                        selectedUtr.id === utr.id
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        setSelectedUtrId(utr.id)
                      }
                    >
                      <span
                        className={`admin-utr-dot ${utr.estado.toLowerCase()}`}
                      ></span>

                      <span>
                        <strong>{utr.nsut}</strong>

                        <small>
                          {utr.estado}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              </article>

              <article className="admin-utr-detail">
                <div className="admin-panel-header">
                  <div>
                    <span>Equipo seleccionado</span>

                    <h3>
                      {selectedUtr.nsut}
                    </h3>
                  </div>

                  <span
                    className={`admin-utr-status ${selectedUtr.estado.toLowerCase()}`}
                  >
                    {selectedUtr.estado}
                  </span>
                </div>

                <div className="admin-utr-reading">
                  <span>Flujo actual</span>

                  <strong>
                    {selectedUtr.flujo}
                  </strong>

                  <small>
                    Actualizado {selectedUtr.actualizacion}
                  </small>
                </div>

                <div className="admin-utr-detail-list">
                  <div>
                    <span>Usuario asignado</span>

                    <strong>
                      {getAssignedUser(selectedUtr)
                        ?.username ||
                        'Sin asignar'}
                    </strong>
                  </div>

                  <div>
                    <span>Velocidad</span>

                    <strong>
                      {selectedUtr.velocidad}
                    </strong>
                  </div>

                  <div>
                    <span>Acumulado</span>

                    <strong>
                      {selectedUtr.acumulado}
                    </strong>
                  </div>

                  <div>
                    <span>Dirección</span>

                    <strong>
                      {selectedUtr.direccion}
                    </strong>
                  </div>

                  <div>
                    <span>Código KER</span>

                    <strong>
                      {selectedUtr.ker}
                    </strong>
                  </div>

                  <div>
                    <span>Ubicación</span>

                    <strong>
                      {selectedUtr.latitude},{' '}
                      {selectedUtr.longitude}
                    </strong>
                  </div>
                </div>

                <button
                  className="admin-detail-action"
                  onClick={() =>
                    openAssignUtr(selectedUtr)
                  }
                >
                  Configurar asignación
                </button>
              </article>
            </div>
          ) : (
            <div className="admin-empty-panel">
              <strong>
                No hay UTRs disponibles
              </strong>

              <p>
                Cuando el backend asigne equipos a esta
                empresa aparecerán en esta sección.
              </p>
            </div>
          )}
        </section>

        {/* ===================================================
            USUARIOS
            =================================================== */}

        <section
          id="usuarios"
          className="admin-section"
        >
          <div className="admin-section-heading">
            <div>
              <span>Usuarios</span>

              <h2>
                Gestión de usuarios
              </h2>
            </div>

            <p>
              Crea y configura las cuentas de usuario
              pertenecientes a tu empresa.
            </p>
          </div>

          <article className="admin-data-panel">
            <div className="admin-toolbar">
              <div className="admin-search">
                <span>Buscar</span>

                <input
                  type="text"
                  placeholder="Nombre, ubicación o ID..."
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <button
                className="admin-primary-action"
                onClick={() =>
                  setShowCreateUser(true)
                }
              >
                <span>+</span>

                Crear usuario
              </button>
            </div>

            <div className="admin-table-shell">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Ubicación</th>
                    <th>Creación</th>
                    <th>UTR asignada</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (adminUser) => {
                      const assignedUtr =
                        utrs.find(
                          (utr) =>
                            utr.id ===
                            adminUser.assigned_utr_id
                        );

                      return (
                        <tr key={adminUser.id}>
                          <td>
                            #{adminUser.id}
                          </td>

                          <td>
                            <strong className="admin-user-name">
                              {adminUser.username}
                            </strong>
                          </td>

                          <td>
                            {adminUser.location}
                          </td>

                          <td>
                            {adminUser.created_at}
                          </td>

                          <td>
                            {assignedUtr?.nsut ||
                              'Sin UTR'}
                          </td>

                          <td>
                            <span
                              className={`admin-user-status ${getUserStatusClass(
                                adminUser.estado
                              )}`}
                            >
                              {adminUser.estado}
                            </span>
                          </td>

                          <td>
                            <div className="admin-action-group">
                              <button
                                onClick={() =>
                                  openEditUser(
                                    adminUser
                                  )
                                }
                              >
                                Configurar
                              </button>

                              <button
                                className="danger"
                                onDoubleClick={() =>
                                  handleDeleteUser(
                                    adminUser
                                  )
                                }
                                title="Haz doble clic para borrar este usuario"
                              >
                                Borrar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="admin-no-results">
                  No se encontraron usuarios.
                </div>
              )}
            </div>
          </article>
        </section>

        {/* ===================================================
            INVENTARIO
            =================================================== */}

        <section
          id="inventario"
          className="admin-section"
        >
          <div className="admin-section-heading">
            <div>
              <span>Inventario</span>

              <h2>
                UTRs asignadas
              </h2>
            </div>

            <p>
              Consulta los equipos disponibles y administra
              sus asignaciones.
            </p>
          </div>

          <article className="admin-data-panel">
            <div className="admin-toolbar">
              <div className="admin-search">
                <span>Buscar equipo</span>

                <input
                  type="text"
                  placeholder="ID, NSUT, NSUE o NSM..."
                  value={utrSearch}
                  onChange={(event) =>
                    setUtrSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-toolbar-result">
                {filteredUtrs.length}{' '}
                {filteredUtrs.length === 1
                  ? 'equipo'
                  : 'equipos'}
              </div>
            </div>

            <div className="admin-table-shell">
              <table className="admin-table admin-utr-table">
                <thead>
                  <tr>
                    <th>NSUT</th>
                    <th>NSUE</th>
                    <th>NSM</th>
                    <th>Estado</th>
                    <th>Usuario</th>
                    <th>Flujo</th>
                    <th>Velocidad</th>
                    <th>Actualización</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUtrs.map((utr) => (
                    <tr
                      key={utr.id}
                      className={
                        selectedUtr?.id === utr.id
                          ? 'selected'
                          : ''
                      }
                      onClick={() =>
                        setSelectedUtrId(utr.id)
                      }
                    >
                      <td>
                        <strong>
                          {utr.nsut}
                        </strong>
                      </td>

                      <td>{utr.nsue}</td>

                      <td>{utr.nsm}</td>

                      <td>
                        <span
                          className={`admin-utr-status ${utr.estado.toLowerCase()}`}
                        >
                          {utr.estado}
                        </span>
                      </td>

                      <td>
                        {getAssignedUser(utr)
                          ?.username ||
                          'Sin asignar'}
                      </td>

                      <td>{utr.flujo}</td>

                      <td>{utr.velocidad}</td>

                      <td>
                        {utr.actualizacion}
                      </td>

                      <td>
                        <button
                          className="admin-assign-button"
                          onClick={(event) => {
                            event.stopPropagation();

                            openAssignUtr(utr);
                          }}
                        >
                          Asignar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUtrs.length === 0 && (
                <div className="admin-no-results">
                  No se encontraron UTRs.
                </div>
              )}
            </div>
          </article>
        </section>

        {/* ===================================================
            TELEMETRÍA
            =================================================== */}

        <section
          id="graficas"
          className="admin-section"
        >
          <div className="admin-section-heading">
            <div>
              <span>Telemetría</span>

              <h2>
                Lecturas del equipo
              </h2>
            </div>

            <p>
              {selectedUtr
                ? `Datos de ${selectedUtr.nsut}`
                : 'Sin equipo seleccionado'}
            </p>
          </div>

          <article className="admin-chart-panel">
            <TelemetryChart
              data={realTimeTelemetryData}
            />
          </article>
        </section>

        {/* ===================================================
            HISTORIAL
            =================================================== */}

        <section
          id="historial"
          className="admin-section"
        >
          <div className="admin-section-heading">
            <div>
              <span>Historial</span>

              <h2>
                Registro de actividad
              </h2>
            </div>

            <p>
              Consulta los movimientos realizados
              desde el panel.
            </p>
          </div>

          <article className="admin-history-panel">
            <div className="admin-toolbar">
              <div className="admin-search">
                <span>Filtrar actividad</span>

                <input
                  type="text"
                  placeholder="ID, fecha, usuario o acción..."
                  value={historySearch}
                  onChange={(event) =>
                    setHistorySearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="admin-toolbar-result">
                {filteredHistory.length}{' '}
                movimientos
              </div>
            </div>

            <div className="admin-history-list">
              {filteredHistory.map(
                (item) => (
                  <article
                    key={item.id}
                    className="admin-history-item"
                  >
                    <div className="admin-history-marker">
                      <span></span>
                    </div>

                    <div className="admin-history-content">
                      <div className="admin-history-top">
                        <strong>
                          {item.action}
                        </strong>

                        <span>
                          #{item.id}
                        </span>
                      </div>

                      <p>
                        {item.target}
                      </p>

                      <div className="admin-history-meta">
                        <span>
                          {item.date}
                        </span>

                        <span>
                          Realizado por {item.user}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              )}

              {filteredHistory.length === 0 && (
                <div className="admin-no-results">
                  No se encontraron movimientos.
                </div>
              )}
            </div>
          </article>
        </section>
      </section>

      {/* =====================================================
          MODAL CREAR USUARIO
          ===================================================== */}

      {showCreateUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <span>
                  Nuevo usuario
                </span>

                <h2>
                  Crear cuenta
                </h2>

                <p>
                  Registra un usuario perteneciente
                  a esta empresa.
                </p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() =>
                  setShowCreateUser(false)
                }
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateUser}>
              <label>
                Nombre de usuario

                <input
                  type="text"
                  value={newUser.username}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,

                      username:
                        event.target.value,
                    })
                  }
                  placeholder="Ej. cliente_puebla"
                  required
                />
              </label>

              <label>
                Contraseña

                <input
                  type="password"
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,

                      password:
                        event.target.value,
                    })
                  }
                  placeholder="Contraseña del usuario"
                  required
                />
              </label>

              <label>
                Ubicación

                <input
                  type="text"
                  value={newUser.location}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,

                      location:
                        event.target.value,
                    })
                  }
                  placeholder="Ej. Puebla, Pue."
                />
              </label>

              <div className="admin-modal-note">
                La UTR podrá asignarse después
                desde la sección de Inventario.
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateUser(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  Crear usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL CONFIGURAR USUARIO
          ===================================================== */}

      {showEditUser && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <span>
                  Configuración
                </span>

                <h2>
                  {selectedUser.username}
                </h2>

                <p>
                  Modifica la información y el estado
                  de esta cuenta.
                </p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() =>
                  setShowEditUser(false)
                }
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateUser}>
              <label>
                Nombre de usuario

                <input
                  type="text"
                  value={editUser.username}
                  onChange={(event) =>
                    setEditUser({
                      ...editUser,

                      username:
                        event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Nueva contraseña

                <input
                  type="password"
                  value={editUser.password}
                  onChange={(event) =>
                    setEditUser({
                      ...editUser,

                      password:
                        event.target.value,
                    })
                  }
                  placeholder="Dejar vacío para conservarla"
                />
              </label>

              <label>
                Ubicación

                <input
                  type="text"
                  value={editUser.location}
                  onChange={(event) =>
                    setEditUser({
                      ...editUser,

                      location:
                        event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Estado de la cuenta

                <select
                  value={editUser.estado}
                  onChange={(event) =>
                    setEditUser({
                      ...editUser,

                      estado:
                        event.target
                          .value as UserStatus,
                    })
                  }
                >
                  <option value="Activo">
                    Activo
                  </option>

                  <option value="Inactivo">
                    Inactivo
                  </option>

                  <option value="Bloqueado">
                    Bloqueado
                  </option>
                </select>
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowEditUser(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL ASIGNAR UTR
          ===================================================== */}

      {showAssignUtr && selectedAssignUtr && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <span>
                  Asignación de equipo
                </span>

                <h2>
                  {selectedAssignUtr.nsut}
                </h2>

                <p>
                  Selecciona el usuario que tendrá
                  acceso a esta UTR.
                </p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() =>
                  setShowAssignUtr(false)
                }
                aria-label="Cerrar modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAssignUtr}>
              <label>
                Usuario asignado

                <select
                  value={assignUserId}
                  onChange={(event) =>
                    setAssignUserId(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Sin asignar
                  </option>

                  {adminUsers.map(
                    (adminUser) => (
                      <option
                        key={adminUser.id}
                        value={adminUser.id}
                        disabled={
                          adminUser.estado !==
                          'Activo'
                        }
                      >
                        {adminUser.username}
                        {adminUser.estado !==
                        'Activo'
                          ? ` — ${adminUser.estado}`
                          : ''}
                      </option>
                    )
                  )}
                </select>
              </label>

              <div className="admin-modal-note">
                Al asignar esta UTR a un usuario que
                ya tiene otro equipo, la asignación
                anterior será retirada.
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowAssignUtr(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  Guardar asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};