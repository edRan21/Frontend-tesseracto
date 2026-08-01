import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/UserPanel.css';

import { UserMap } from '../components/UserMap';
import { TelemetryChart } from '../components/TelemetryChart';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import logoTesseracto from '../assets/TESSERACTOLOGONEGROp.png';

type UtrStatus = 'Activa' | 'Advertencia' | 'Inactiva';

interface AssignedUtr {
  id: number;
  nsut: string;
  nsue: string;
  nsm: string;
  alias: string;
  estado: UtrStatus;

  flujo: string;
  acumulado: string;
  velocidad: string;
  direccion: string;
  ker: string;

  actualizacion: string;
  ubicacion: string;
  instalacion: string;

  latitude: number;
  longitude: number;
  is_active: boolean;
}

interface TelemetryPoint {
  timestamp: string;
  flow_instant: number;
  flow_accumulated: number;
  flow_velocity: number;
}

export const UserPanel = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  /*
    =========================================================
    TODO BACKEND - UTRs DEL USUARIO
    =========================================================

    DATOS TEMPORALES.

    En producción reemplazar este arreglo por una petición al backend.

    Endpoint ideal:
    GET /api/user/utrs

    También puede ser:
    GET /api/user/utr

    IMPORTANTE:
    El backend debe regresar SOLAMENTE las UTRs asignadas
    al usuario autenticado.

    Normalmente el usuario tendrá UNA UTR.

    Si el backend regresa más de una, el panel mostrará
    automáticamente un selector de equipos.
  */

  const mockAssignedUtrs: AssignedUtr[] = [
    {
      id: 1,

      nsut: 'UTR-001',
      nsue: 'NSUE-001',
      nsm: 'NSM-001',

      alias: 'Equipo principal',

      estado: 'Activa',

      flujo: '25.6 L/s',
      acumulado: '12,450 L',
      velocidad: '1.8 m/s',
      direccion: 'Normal',
      ker: 'OK',

      actualizacion: 'Hace 2 min',
      ubicacion: 'Puebla, Pue.',
      instalacion: '05/07/2026',

      latitude: 19.0414,
      longitude: -98.2063,

      is_active: true,
    },

    /*
      =======================================================
      PRUEBA DE VARIAS UTRs
      =======================================================

      Descomentar únicamente para probar el selector.

      {
        id: 2,

        nsut: 'UTR-002',
        nsue: 'NSUE-002',
        nsm: 'NSM-002',

        alias: 'Equipo secundario',

        estado: 'Advertencia',

        flujo: '12.4 L/s',
        acumulado: '8,120 L',
        velocidad: '0.9 m/s',
        direccion: 'Normal',
        ker: 'WARNING',

        actualizacion: 'Hace 8 min',
        ubicacion: 'Ciudad de México',
        instalacion: '06/07/2026',

        latitude: 19.4326,
        longitude: -99.1332,

        is_active: true,
      },
    */
  ];

  /*
    =========================================================
    ESTADO DE UTRs
    =========================================================

    TODO BACKEND:

    Posteriormente assignedUtrs deberá llenarse con la respuesta
    recibida desde un service.

    Ejemplo:

    const utrs = await getUserUtrsRequest();
    setAssignedUtrs(utrs);
  */

  const [assignedUtrs] = useState<AssignedUtr[]>(mockAssignedUtrs);

  const [selectedUtrId, setSelectedUtrId] = useState<number>(
    mockAssignedUtrs[0]?.id ?? 0
  );

  const selectedUtr = useMemo(() => {
    return (
      assignedUtrs.find((utr) => utr.id === selectedUtrId) ||
      assignedUtrs[0] ||
      null
    );
  }, [assignedUtrs, selectedUtrId]);

  /*
    =========================================================
    TODO BACKEND - TELEMETRÍA HISTÓRICA
    =========================================================

    Reemplazar este arreglo por la telemetría real.

    Endpoint sugerido:
    GET /api/utr/:id/telemetry/history

    El endpoint debe utilizar selectedUtr.id.

    Ejemplo esperado:

    [
      {
        timestamp: "12:00",
        flow_instant: 25.6,
        flow_accumulated: 12450,
        flow_velocity: 1.8
      }
    ]

    Para tiempo real posteriormente se puede utilizar:
    - WebSocket
    - Server-Sent Events
    - Polling
  */

  const telemetryHistory: TelemetryPoint[] = [];

  const hasMultipleUtrs = assignedUtrs.length > 1;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  /*
    =========================================================
    USUARIO SIN UTR
    =========================================================

    Esta pantalla aparece si el backend regresa un arreglo vacío.
  */

  if (!selectedUtr) {
    return (
      <main className="user-page">
        <div className="user-bg-grid"></div>

        <section className="user-empty-state">
          <img src={logoTesseracto} alt="Logo Tesseracto" />

          <span>Sin equipo asignado</span>

          <h1>No tienes una UTR disponible</h1>

          <p>
            Actualmente no existe ningún equipo asociado a tu usuario.
            Cuando se realice una asignación podrás consultar su información
            desde este panel.
          </p>

          <button
            className="user-logout-button"
            onClick={handleLogout}
          >
            <span className="user-logout-icon">
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

            <span className="user-logout-text">
              <small>Finalizar</small>
              <strong>Cerrar sesión</strong>
            </span>
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="user-page">
      <div className="user-bg-grid"></div>

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="user-sidebar">
        <div className="sidebar-brand">
          <div className="user-logo">
            <img
              src={logoTesseracto}
              alt="Logo Tesseracto"
            />
          </div>

          <div>
            <h2>Tesseracto</h2>
            <p>Mi panel</p>
          </div>
        </div>

        <nav>
          <a href="#resumen" className="active">
            Resumen
          </a>

          <a href="#equipo">
            Mi equipo
          </a>

          <a href="#mapa">
            Ubicación
          </a>

          <a href="#graficas">
            Gráficas
          </a>

          <a href="#reportes">
            Reportes
          </a>
        </nav>

        <div className="sidebar-user">
          <span>Sesión activa</span>

          <strong>
            {user?.username || 'Usuario de prueba'}
          </strong>

          <small>
            Cuenta personal
          </small>
        </div>
      </aside>

      {/* =====================================================
          CONTENIDO
          ===================================================== */}

      <section className="user-content">
        <header className="user-header">
          <div>
            <span className="page-kicker">
              Mi equipo
            </span>

            <h1>
              Hola, {user?.username || 'usuario'}
            </h1>

            <p>
              Aquí puedes consultar el estado y las lecturas más recientes
              de tu equipo asignado.
            </p>
          </div>

          <button
            className="user-logout-button"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="user-logout-icon">
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

            <span className="user-logout-text">
              <small>Finalizar</small>
              <strong>Cerrar sesión</strong>
            </span>
          </button>
        </header>

        {/* =====================================================
            SELECTOR

            Solo aparece cuando el usuario tiene más de una UTR.
            ===================================================== */}

        {hasMultipleUtrs && (
          <section className="user-equipment-selector">
            <span>Mis equipos</span>

            <div>
              {assignedUtrs.map((utr) => (
                <button
                  key={utr.id}
                  className={
                    selectedUtr.id === utr.id
                      ? 'active'
                      : ''
                  }
                  onClick={() => setSelectedUtrId(utr.id)}
                >
                  <strong>{utr.alias}</strong>
                  <small>{utr.nsut}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* =====================================================
            RESUMEN PRINCIPAL
            ===================================================== */}

        <section
          id="resumen"
          className="user-overview-card"
        >
          <div className="user-overview-info">
            <div className="user-status-line">
              <span
                className={`user-live-dot ${selectedUtr.estado.toLowerCase()}`}
              ></span>

              <strong>
                {selectedUtr.estado}
              </strong>

              <small>
                {selectedUtr.actualizacion}
              </small>
            </div>

            <span className="user-equipment-label">
              {selectedUtr.nsut}
            </span>

            <h2>
              {selectedUtr.alias}
            </h2>

            <p>
              Equipo ubicado en{' '}
              <strong>
                {selectedUtr.ubicacion}
              </strong>.
            </p>
          </div>

          <div className="user-overview-reading">
            <span>
              Flujo actual
            </span>

            <strong>
              {selectedUtr.flujo}
            </strong>

            <small>
              Lectura registrada {selectedUtr.actualizacion}
            </small>
          </div>

          <div className="user-overview-values">
            <div>
              <span>Velocidad</span>
              <strong>{selectedUtr.velocidad}</strong>
            </div>

            <div>
              <span>Acumulado</span>
              <strong>{selectedUtr.acumulado}</strong>
            </div>

            <div>
              <span>KER</span>
              <strong>{selectedUtr.ker}</strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            INFORMACIÓN + MAPA
            ===================================================== */}

        <section className="user-main-grid">
          <article
            id="equipo"
            className="glass-card user-equipment-card"
          >
            <div className="user-section-title">
              <div>
                <span>Información</span>
                <h2>Detalles de tu equipo</h2>
              </div>

              <p>{selectedUtr.nsut}</p>
            </div>

            <div className="user-detail-list">
              <div>
                <span>Estado</span>

                <strong
                  className={`detail-status ${selectedUtr.estado.toLowerCase()}`}
                >
                  {selectedUtr.estado}
                </strong>
              </div>

              <div>
                <span>NSUE</span>
                <strong>{selectedUtr.nsue}</strong>
              </div>

              <div>
                <span>NSM</span>
                <strong>{selectedUtr.nsm}</strong>
              </div>

              <div>
                <span>Ubicación</span>
                <strong>{selectedUtr.ubicacion}</strong>
              </div>

              <div>
                <span>Fecha de instalación</span>
                <strong>{selectedUtr.instalacion}</strong>
              </div>

              <div>
                <span>Dirección de flujo</span>
                <strong>{selectedUtr.direccion}</strong>
              </div>

              <div>
                <span>Comunicación</span>

                <strong>
                  {selectedUtr.is_active
                    ? 'En línea'
                    : 'Sin comunicación'}
                </strong>
              </div>
            </div>
          </article>

          <article
            id="mapa"
            className="glass-card user-map-card"
          >
            <div className="user-section-title">
              <div>
                <span>Ubicación</span>
                <h2>¿Dónde está mi equipo?</h2>
              </div>

              <p>
                {selectedUtr.ubicacion}
              </p>
            </div>

            <UserMap utrs={[selectedUtr]} />
          </article>
        </section>

        {/* =====================================================
            GRÁFICAS
            ===================================================== */}

        <section
          id="graficas"
          className="glass-card charts-card"
        >
          <div className="user-section-title">
            <div>
              <span>Lecturas</span>
              <h2>Historial de telemetría</h2>
            </div>

            <p>
              {selectedUtr.nsut}
            </p>
          </div>

          <TelemetryChart data={telemetryHistory} />
        </section>

        {/* =====================================================
            REPORTES
            ===================================================== */}

        <section
          id="reportes"
          className="glass-card report-card"
        >
          <div className="user-section-title">
            <div>
              <span>Historial</span>
              <h2>Mis reportes</h2>
            </div>

            <p>
              Información de {selectedUtr.nsut}
            </p>
          </div>

          <div className="report-placeholder">
            <div>
              <strong>
                Reportes del equipo
              </strong>

              <span>
                En esta sección se mostrarán los reportes e históricos
                autorizados para tu UTR.
              </span>
            </div>

            <button
              type="button"
              disabled
            >
              Próximamente
            </button>
          </div>
        </section>
      </section>
    </main>
  );
};