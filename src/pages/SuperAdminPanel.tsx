// src/pages/AdminPanel.tsx

import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/SuperAdminPanel.css';

import { UserMap } from '../components/UserMap';
import { TelemetryChart } from '../components/TelemetryChart';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

import logoTesseracto from '../assets/TESSERACTOLOGONEGROp.png';

/* =========================================================
   TIPOS
   ========================================================= */

type AccountStatus = 'Activo' | 'Inactivo' | 'Bloqueado';

type CompanyStatus = 'Activa' | 'Inactiva' | 'Bloqueada';

type UtrStatus =
  | 'Activa'
  | 'Advertencia'
  | 'Inactiva'
  | 'Bloqueada'
  | 'Nueva';

type AccountRole = 'admin' | 'user';

interface Company {
  id: number;
  company_name: string;
  rfc: string;
  email: string;
  phones: string[];
  location: string;
  status: CompanyStatus;
  created_at: string;
}

interface SystemAccount {
  id: number;
  username: string;
  role: AccountRole;
  client_id: number | null;
  status: AccountStatus;
  created_at: string;
  last_login?: string;
}

interface SystemUtr {
  id: number;

  tracking_name: string;

  nsut: string;
  nsue: string;
  nsm: string;

  status: UtrStatus;

  flujo: string;
  acumulado: string;
  velocidad: string;
  direccion: string;

  ker: string;

  actualizacion: string;
  created_at: string;

  latitude: number;
  longitude: number;

  is_active: boolean;

  client_id: number | null;
  assigned_user_id: number | null;
}

interface HistoryItem {
  id: number;
  date: string;
  action: string;
  target: string;
  actor: string;
}

interface TelemetryPoint {
  timestamp: string;
  flow_instant: number;
  flow_accumulated: number;
  flow_velocity: number;
}

/* =========================================================
   FUNCIONES AUXILIARES
   ========================================================= */

const getNextId = (
  items: Array<{ id: number }>
): number => {
  return (
    Math.max(
      0,
      ...items.map((item) => item.id)
    ) + 1
  );
};

const parsePhones = (
  value: string
): string[] => {
  return value
    .split(/[,;\n]/)
    .map((phone) => phone.trim())
    .filter(Boolean);
};

/* =========================================================
   PANEL CONTROL GLOBAL
   ========================================================= */

export const SuperAdminPanel = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  /* =========================================================
     IMPORTANTE - CONEXIÓN CON BACKEND
     =========================================================

     Actualmente este archivo utiliza datos simulados.

     NO debe existir comunicación directa entre:

     SuperAdminPanel
     AdminPanel
     UserPanel

     La comunicación correcta es:

     FRONTEND
         ↓
     BACKEND
         ↓
     BASE DE DATOS

     Ejemplo:

     Control global asigna UTR-001 a Empresa Puebla
                       ↓
     Backend guarda client_id en UTR-001
                       ↓
     AdminPanel consulta sus UTRs
                       ↓
     Backend regresa UTR-001 porque pertenece a su client_id

     Esto permite que TODOS los paneles vean información consistente.

     Servicios frontend sugeridos:

     services/
       companyService.ts
       accountService.ts
       superAdminService.ts
       utrService.ts
       historyService.ts

     Endpoints sugeridos:

     GET    /api/super/dashboard

     GET    /api/clients
     POST   /api/clients
     PUT    /api/clients/:id
     DELETE /api/clients/:id

     GET    /api/super/accounts
     POST   /api/super/accounts
     PUT    /api/super/accounts/:id
     DELETE /api/super/accounts/:id

     GET    /api/super/utrs
     PUT    /api/super/utrs/:id

     GET    /api/super/history

     IMPORTANTE:

     Las rutas anteriores son una propuesta de organización.
     Deben verificarse con las rutas reales del backend antes
     de conectar este componente.
  */

  /* =========================================================
     EMPRESAS MOCK
     ========================================================= */

  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 1,
      company_name: 'Ingeniería Puebla',
      rfc: 'INP260101ABC',
      email: 'contacto@ingenieriapuebla.mx',
      phones: [
        '222 123 4567',
        '222 765 4321',
      ],
      location: 'Puebla, Pue.',
      status: 'Activa',
      created_at: '2026-06-15',
    },

    {
      id: 2,
      company_name: 'Control Hidráulico CDMX',
      rfc: 'CHC260201XYZ',
      email: 'operacion@controlhidraulico.mx',
      phones: [
        '55 1234 9876',
      ],
      location: 'Ciudad de México',
      status: 'Activa',
      created_at: '2026-06-22',
    },

    {
      id: 3,
      company_name: 'Servicios Morelos',
      rfc: 'SEM260305KLM',
      email: 'admin@serviciosmorelos.mx',
      phones: [
        '777 222 4411',
      ],
      location: 'Cuernavaca, Mor.',
      status: 'Bloqueada',
      created_at: '2026-07-01',
    },
  ]);

  /* =========================================================
     CUENTAS MOCK
     ========================================================= */

  const [accounts, setAccounts] =
    useState<SystemAccount[]>([
      {
        id: 1,
        username: 'admin_puebla',
        role: 'admin',
        client_id: 1,
        status: 'Activo',
        created_at: '2026-06-15',
        last_login: 'Hace 15 min',
      },

      {
        id: 2,
        username: 'admin_cdmx',
        role: 'admin',
        client_id: 2,
        status: 'Activo',
        created_at: '2026-06-22',
        last_login: 'Hace 2 h',
      },

      {
        id: 3,
        username: 'cliente_puebla',
        role: 'user',
        client_id: 1,
        status: 'Activo',
        created_at: '2026-07-01',
        last_login: 'Hace 30 min',
      },

      {
        id: 4,
        username: 'cliente_cdmx',
        role: 'user',
        client_id: 2,
        status: 'Activo',
        created_at: '2026-07-04',
        last_login: 'Ayer',
      },

      {
        id: 5,
        username: 'cliente_morelos',
        role: 'user',
        client_id: 3,
        status: 'Bloqueado',
        created_at: '2026-07-07',
        last_login: 'Hace 4 días',
      },
    ]);

  /* =========================================================
     UTRs MOCK
     ========================================================= */

  const [utrs, setUtrs] =
    useState<SystemUtr[]>([
      {
        id: 1,

        tracking_name: 'TESS-UTR-0001',

        nsut: 'UTR-001',
        nsue: 'NSUE-001',
        nsm: 'NSM-001',

        status: 'Activa',

        flujo: '25.6 L/s',
        acumulado: '12,450 L',
        velocidad: '1.8 m/s',
        direccion: 'Normal',

        ker: 'OK',

        actualizacion: 'Hace 2 min',
        created_at: '2026-06-10',

        latitude: 19.0414,
        longitude: -98.2063,

        is_active: true,

        client_id: 1,
        assigned_user_id: 3,
      },

      {
        id: 2,

        tracking_name: 'TESS-UTR-0002',

        nsut: 'UTR-002',
        nsue: 'NSUE-002',
        nsm: 'NSM-002',

        status: 'Advertencia',

        flujo: '12.4 L/s',
        acumulado: '8,120 L',
        velocidad: '0.9 m/s',
        direccion: 'Normal',

        ker: 'WARNING',

        actualizacion: 'Hace 8 min',
        created_at: '2026-06-18',

        latitude: 19.4326,
        longitude: -99.1332,

        is_active: true,

        client_id: 2,
        assigned_user_id: 4,
      },

      {
        id: 3,

        tracking_name: 'TESS-UTR-0003',

        nsut: 'UTR-003',
        nsue: 'NSUE-003',
        nsm: 'NSM-003',

        status: 'Inactiva',

        flujo: '0.0 L/s',
        acumulado: '0 L',
        velocidad: '0.0 m/s',
        direccion: 'Sin flujo',

        ker: 'SIN DATOS',

        actualizacion: 'Hace 1 h',
        created_at: '2026-06-28',

        latitude: 18.9242,
        longitude: -99.2216,

        is_active: false,

        client_id: 3,
        assigned_user_id: null,
      },

      {
        id: 4,

        tracking_name: 'TESS-UTR-0004',

        nsut: 'UTR-004',
        nsue: 'NSUE-004',
        nsm: 'NSM-004',

        status: 'Nueva',

        flujo: '0.0 L/s',
        acumulado: '0 L',
        velocidad: '0.0 m/s',
        direccion: 'Pendiente',

        ker: 'PENDING',

        actualizacion: 'Sin lectura',
        created_at: '2026-07-09',

        latitude: 19.05,
        longitude: -98.19,

        is_active: false,

        client_id: null,
        assigned_user_id: null,
      },

      {
        id: 5,

        tracking_name: 'TESS-UTR-0005',

        nsut: 'UTR-005',
        nsue: 'NSUE-005',
        nsm: 'NSM-005',

        status: 'Bloqueada',

        flujo: '0.0 L/s',
        acumulado: '3,450 L',
        velocidad: '0.0 m/s',
        direccion: 'Detenida',

        ker: 'LOCKED',

        actualizacion: 'Hace 2 días',
        created_at: '2026-06-30',

        latitude: 19.12,
        longitude: -98.22,

        is_active: false,

        client_id: 1,
        assigned_user_id: null,
      },
    ]);

  /* =========================================================
     HISTORIAL MOCK
     ========================================================= */

  const [history, setHistory] =
    useState<HistoryItem[]>([
      {
        id: 1,
        date: '09/07/2026 09:32',
        action: 'Nueva UTR detectada',
        target:
          'TESS-UTR-0004 agregada al inventario',
        actor: 'Sistema',
      },

      {
        id: 2,
        date: '08/07/2026 14:20',
        action: 'Asignación de empresa',
        target:
          'UTR-002 asignada a Control Hidráulico CDMX',
        actor: 'control_global',
      },

      {
        id: 3,
        date: '08/07/2026 10:05',
        action: 'Cuenta bloqueada',
        target:
          'cliente_morelos fue bloqueado',
        actor: 'control_global',
      },

      {
        id: 4,
        date: '07/07/2026 16:40',
        action: 'Empresa registrada',
        target:
          'Servicios Morelos fue registrada',
        actor: 'control_global',
      },
    ]);

  /* =========================================================
     BUSCADORES
     ========================================================= */

  const [companySearch, setCompanySearch] =
    useState('');

  const [adminSearch, setAdminSearch] =
    useState('');

  const [userSearch, setUserSearch] =
    useState('');

  const [utrSearch, setUtrSearch] =
    useState('');

  const [historySearch, setHistorySearch] =
    useState('');

  /* =========================================================
     MODALES
     ========================================================= */

  const [
    showCreateCompany,
    setShowCreateCompany,
  ] = useState(false);

  const [
    showConfigureCompany,
    setShowConfigureCompany,
  ] = useState(false);

  const [
    showCreateAdmin,
    setShowCreateAdmin,
  ] = useState(false);

  const [
    showCreateUser,
    setShowCreateUser,
  ] = useState(false);

  const [
    showConfigureAccount,
    setShowConfigureAccount,
  ] = useState(false);

  const [
    showConfigureUtr,
    setShowConfigureUtr,
  ] = useState(false);

  const [
    showUtrDetail,
    setShowUtrDetail,
  ] = useState(false);

  /* =========================================================
     ELEMENTOS SELECCIONADOS
     ========================================================= */

  const [
    selectedCompany,
    setSelectedCompany,
  ] = useState<Company | null>(null);

  const [
    selectedAccount,
    setSelectedAccount,
  ] = useState<SystemAccount | null>(null);

  const [
    selectedUtr,
    setSelectedUtr,
  ] = useState<SystemUtr | null>(null);

  /* =========================================================
     FORMULARIO EMPRESA
     ========================================================= */

  const [companyForm, setCompanyForm] =
    useState({
      company_name: '',
      rfc: '',
      email: '',
      phones: '',
      location: '',
      status: 'Activa' as CompanyStatus,
    });

  const [
    companyUtrSelection,
    setCompanyUtrSelection,
  ] = useState<number[]>([]);

  /* =========================================================
     FORMULARIO CUENTA
     ========================================================= */

  const [accountForm, setAccountForm] =
    useState({
      username: '',
      password: '',
      client_id: '',
      status: 'Activo' as AccountStatus,
    });

  /* =========================================================
     FORMULARIO UTR
     ========================================================= */

  const [utrForm, setUtrForm] =
    useState({
      client_id: '',
      status: 'Nueva' as UtrStatus,
    });

  /* =========================================================
     TELEMETRÍA DE DETALLE
     =========================================================

     TODO BACKEND:

     Al abrir "Ver más" en una UTR se debe consultar:

     GET /api/utr/:id/telemetry/history

     usando selectedUtr.id.

     Este arreglo se remplazará con la respuesta.
  */

  const utrTelemetryData: TelemetryPoint[] = [];

  /* =========================================================
     DATOS DERIVADOS
     ========================================================= */

  const admins = useMemo(() => {
    return accounts.filter(
      (account) => account.role === 'admin'
    );
  }, [accounts]);

  const finalUsers = useMemo(() => {
    return accounts.filter(
      (account) => account.role === 'user'
    );
  }, [accounts]);

  const getCompany = (
    clientId: number | null
  ) => {
    return companies.find(
      (company) => company.id === clientId
    );
  };

  const getAssignedUser = (
    userId: number | null
  ) => {
    return accounts.find(
      (account) =>
        account.id === userId &&
        account.role === 'user'
    );
  };

  /* =========================================================
     FILTROS
     ========================================================= */

  const filteredCompanies = useMemo(() => {
    const query =
      companySearch.toLowerCase().trim();

    return companies.filter((company) => {
      return (
        company.company_name
          .toLowerCase()
          .includes(query) ||

        company.rfc
          .toLowerCase()
          .includes(query) ||

        company.email
          .toLowerCase()
          .includes(query) ||

        company.location
          .toLowerCase()
          .includes(query) ||

        String(company.id)
          .includes(query)
      );
    });
  }, [companies, companySearch]);

  const filteredAdmins = useMemo(() => {
    const query =
      adminSearch.toLowerCase().trim();

    return admins.filter((account) => {
      const company =
        getCompany(account.client_id);

      return (
        account.username
          .toLowerCase()
          .includes(query) ||

        company?.company_name
          .toLowerCase()
          .includes(query) ||

        String(account.id)
          .includes(query)
      );
    });
  }, [admins, adminSearch, companies]);

  const filteredUsers = useMemo(() => {
    const query =
      userSearch.toLowerCase().trim();

    return finalUsers.filter((account) => {
      const company =
        getCompany(account.client_id);

      return (
        account.username
          .toLowerCase()
          .includes(query) ||

        company?.company_name
          .toLowerCase()
          .includes(query) ||

        String(account.id)
          .includes(query)
      );
    });
  }, [finalUsers, userSearch, companies]);

  const filteredUtrs = useMemo(() => {
    const query =
      utrSearch.toLowerCase().trim();

    return utrs.filter((utr) => {
      const company =
        getCompany(utr.client_id);

      return (
        utr.tracking_name
          .toLowerCase()
          .includes(query) ||

        utr.nsut
          .toLowerCase()
          .includes(query) ||

        utr.nsue
          .toLowerCase()
          .includes(query) ||

        utr.nsm
          .toLowerCase()
          .includes(query) ||

        company?.company_name
          .toLowerCase()
          .includes(query) ||

        String(utr.id)
          .includes(query)
      );
    });
  }, [utrs, utrSearch, companies]);

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

        item.actor
          .toLowerCase()
          .includes(query) ||

        String(item.id)
          .includes(query)
      );
    });
  }, [history, historySearch]);

  /* =========================================================
     MÉTRICAS
     ========================================================= */

  const activeUtrs = utrs.filter(
    (utr) => utr.status === 'Activa'
  ).length;

  const inactiveUtrs = utrs.filter(
    (utr) => utr.status === 'Inactiva'
  ).length;

  const blockedUtrs = utrs.filter(
    (utr) => utr.status === 'Bloqueada'
  ).length;

  const newUtrs = utrs.filter(
    (utr) => utr.status === 'Nueva'
  ).length;

  const warningUtrs = utrs.filter(
    (utr) => utr.status === 'Advertencia'
  ).length;

  /* =========================================================
     HISTORIAL
     ========================================================= */

  const addHistory = (
    action: string,
    target: string
  ) => {
    setHistory((prev) => {
      const historyItem: HistoryItem = {
        id: getNextId(prev),

        date:
          new Date().toLocaleString('es-MX'),

        action,

        target,

        actor:
          user?.username || 'control_global',
      };

      return [
        historyItem,
        ...prev,
      ];
    });
  };

  /* =========================================================
     CERRAR SESIÓN
     ========================================================= */

  const handleLogout = () => {
    logout();

    navigate(ROUTES.LOGIN);
  };

  /* =========================================================
     VALIDAR USERNAME
     ========================================================= */

  const usernameExists = (
    username: string,
    ignoredId?: number
  ) => {
    return accounts.some(
      (account) =>
        account.id !== ignoredId &&
        account.username
          .trim()
          .toLowerCase() ===
          username.trim().toLowerCase()
    );
  };

  /* =========================================================
     CREAR EMPRESA
     ========================================================= */

  const handleCreateCompany = (
    event: FormEvent
  ) => {
    event.preventDefault();

    const companyName =
      companyForm.company_name.trim();

    const email =
      companyForm.email.trim();

    const location =
      companyForm.location.trim();

    if (companyName.length < 3) {
      alert(
        'El nombre de la empresa debe tener al menos 3 caracteres.'
      );

      return;
    }

    const companyAlreadyExists =
      companies.some(
        (company) =>
          company.company_name
            .trim()
            .toLowerCase() ===
          companyName.toLowerCase()
      );

    if (companyAlreadyExists) {
      alert(
        'Ya existe una empresa con ese nombre.'
      );

      return;
    }

    if (!email) {
      alert(
        'Ingresa el correo de la empresa.'
      );

      return;
    }

    if (!location) {
      alert(
        'Ingresa la ubicación de la empresa.'
      );

      return;
    }

    const phones =
      parsePhones(companyForm.phones);

    if (phones.length === 0) {
      alert(
        'Ingresa al menos un teléfono.'
      );

      return;
    }

    const newCompany: Company = {
      id: getNextId(companies),

      company_name: companyName,

      rfc:
        companyForm.rfc.trim(),

      email,

      phones,

      location,

      status: companyForm.status,

      created_at:
        new Date()
          .toISOString()
          .split('T')[0],
    };

    /*
      TODO BACKEND:

      Reemplazar por:

      POST /api/clients

      body sugerido:

      {
        company_name,
        rfc,
        email,
        phones,
        location,
        status
      }

      El backend debe regresar la empresa
      con su ID real.
    */

    setCompanies((prev) => [
      newCompany,
      ...prev,
    ]);

    setUtrs((prev) =>
      prev.map((utr) =>
        companyUtrSelection.includes(utr.id)
          ? {
              ...utr,
              client_id: newCompany.id,
            }
          : utr
      )
    );

    addHistory(
      'Empresa registrada',
      `${newCompany.company_name} fue registrada`
    );

    if (companyUtrSelection.length > 0) {
      addHistory(
        'Asignación de UTRs',
        `${companyUtrSelection.length} UTRs asignadas a ${newCompany.company_name}`
      );
    }

    setCompanyForm({
      company_name: '',
      rfc: '',
      email: '',
      phones: '',
      location: '',
      status: 'Activa',
    });

    setCompanyUtrSelection([]);

    setShowCreateCompany(false);
  };

  /* =========================================================
     ABRIR CONFIGURACIÓN EMPRESA
     ========================================================= */

  const openConfigureCompany = (
    company: Company
  ) => {
    setSelectedCompany(company);

    setCompanyForm({
      company_name: company.company_name,
      rfc: company.rfc,
      email: company.email,
      phones: company.phones.join(', '),
      location: company.location,
      status: company.status,
    });

    setCompanyUtrSelection(
      utrs
        .filter(
          (utr) =>
            utr.client_id === company.id
        )
        .map((utr) => utr.id)
    );

    setShowConfigureCompany(true);
  };

  /* =========================================================
     ACTUALIZAR EMPRESA
     ========================================================= */

  const handleUpdateCompany = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!selectedCompany) {
      return;
    }

    const cleanName =
      companyForm.company_name.trim();

    const duplicate =
      companies.some(
        (company) =>
          company.id !== selectedCompany.id &&
          company.company_name
            .toLowerCase() ===
          cleanName.toLowerCase()
      );

    if (duplicate) {
      alert(
        'Ya existe otra empresa con ese nombre.'
      );

      return;
    }

    const phones =
      parsePhones(companyForm.phones);

    if (phones.length === 0) {
      alert(
        'La empresa debe tener al menos un teléfono.'
      );

      return;
    }

    /*
      TODO BACKEND:

      PUT /api/clients/:id

      La asignación de UTRs puede manejarse
      desde un endpoint separado:

      PATCH /api/clients/:id/utrs
    */

    setCompanies((prev) =>
      prev.map((company) =>
        company.id === selectedCompany.id
          ? {
              ...company,

              company_name: cleanName,

              rfc:
                companyForm.rfc.trim(),

              email:
                companyForm.email.trim(),

              phones,

              location:
                companyForm.location.trim(),

              status:
                companyForm.status,
            }
          : company
      )
    );

    setUtrs((prev) =>
      prev.map((utr) => {
        if (
          companyUtrSelection.includes(utr.id)
        ) {
          return {
            ...utr,
            client_id: selectedCompany.id,
          };
        }

        if (
          utr.client_id === selectedCompany.id
        ) {
          return {
            ...utr,
            client_id: null,
            assigned_user_id: null,
          };
        }

        return utr;
      })
    );

    addHistory(
      'Empresa configurada',
      `${cleanName} fue actualizada`
    );

    setShowConfigureCompany(false);

    setSelectedCompany(null);
  };

  /* =========================================================
     ELIMINAR EMPRESA
     ========================================================= */

  const handleDeleteCompany = (
    company: Company
  ) => {
    const companyAccounts =
      accounts.filter(
        (account) =>
          account.client_id === company.id
      );

    const companyUtrs =
      utrs.filter(
        (utr) =>
          utr.client_id === company.id
      );

    if (
      companyAccounts.length > 0 ||
      companyUtrs.length > 0
    ) {
      alert(
        'No puedes eliminar esta empresa mientras tenga administradores, usuarios o UTRs asignadas.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar ${company.company_name}?`
      );

    if (!confirmed) {
      return;
    }

    /*
      TODO BACKEND:

      DELETE /api/clients/:id

      El backend también debe impedir eliminar
      empresas con relaciones activas.
    */

    setCompanies((prev) =>
      prev.filter(
        (item) => item.id !== company.id
      )
    );

    addHistory(
      'Empresa eliminada',
      `${company.company_name} fue eliminada`
    );
  };

  /* =========================================================
     CREAR CUENTA
     ========================================================= */

  const handleCreateAccount = (
    event: FormEvent,
    role: AccountRole
  ) => {
    event.preventDefault();

    const cleanUsername =
      accountForm.username.trim();

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

    if (usernameExists(cleanUsername)) {
      alert(
        'Ese nombre de usuario ya existe.'
      );

      return;
    }

    if (!accountForm.password.trim()) {
      alert(
        'Ingresa una contraseña.'
      );

      return;
    }

    const clientId =
      Number(accountForm.client_id);

    const assignedCompany =
      companies.find(
        (company) =>
          company.id === clientId
      );

    if (!assignedCompany) {
      alert(
        'Selecciona una empresa válida.'
      );

      return;
    }

    const newAccount: SystemAccount = {
      id: getNextId(accounts),

      username: cleanUsername,

      role,

      client_id: clientId,

      status: 'Activo',

      created_at:
        new Date()
          .toISOString()
          .split('T')[0],

      last_login: 'Sin iniciar sesión',
    };

    /*
      TODO BACKEND:

      POST /api/super/accounts

      body:

      {
        username,
        password,
        role,
        client_id
      }

      El backend debe:

      - Validar username único.
      - Hashear contraseña.
      - Validar client_id.
      - Guardar rol.
      - Regresar cuenta creada.
    */

    setAccounts((prev) => [
      newAccount,
      ...prev,
    ]);

    addHistory(
      role === 'admin'
        ? 'Administrador creado'
        : 'Usuario creado',

      `${cleanUsername} asignado a ${assignedCompany.company_name}`
    );

    setAccountForm({
      username: '',
      password: '',
      client_id: '',
      status: 'Activo',
    });

    setShowCreateAdmin(false);

    setShowCreateUser(false);
  };

  /* =========================================================
     CONFIGURAR CUENTA
     ========================================================= */

  const openConfigureAccount = (
    account: SystemAccount
  ) => {
    setSelectedAccount(account);

    setAccountForm({
      username: account.username,
      password: '',
      client_id:
        account.client_id
          ? String(account.client_id)
          : '',
      status: account.status,
    });

    setShowConfigureAccount(true);
  };

  /* =========================================================
     ACTUALIZAR CUENTA
     ========================================================= */

  const handleUpdateAccount = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!selectedAccount) {
      return;
    }

    const cleanUsername =
      accountForm.username.trim();

    if (
      usernameExists(
        cleanUsername,
        selectedAccount.id
      )
    ) {
      alert(
        'Ese nombre de usuario pertenece a otra cuenta.'
      );

      return;
    }

    const clientId =
      Number(accountForm.client_id);

    const company =
      companies.find(
        (item) =>
          item.id === clientId
      );

    if (!company) {
      alert(
        'Selecciona una empresa válida.'
      );

      return;
    }

    /*
      TODO BACKEND:

      PUT /api/super/accounts/:id

      Si password está vacío,
      NO debe cambiarse la contraseña.

      Si tiene contenido:
      - validar
      - hashear
      - guardar nuevo password_hash
    */

    setAccounts((prev) =>
      prev.map((account) =>
        account.id === selectedAccount.id
          ? {
              ...account,

              username: cleanUsername,

              client_id: clientId,

              status:
                accountForm.status,
            }
          : account
      )
    );

    /*
      Si movemos un usuario final a otra empresa,
      quitamos sus UTRs anteriores.

      El backend debe aplicar la misma validación.
    */

    if (
      selectedAccount.role === 'user' &&
      selectedAccount.client_id !== clientId
    ) {
      setUtrs((prev) =>
        prev.map((utr) =>
          utr.assigned_user_id ===
          selectedAccount.id
            ? {
                ...utr,
                assigned_user_id: null,
              }
            : utr
        )
      );
    }

    addHistory(
      'Cuenta configurada',
      `${cleanUsername} fue actualizado`
    );

    setShowConfigureAccount(false);

    setSelectedAccount(null);
  };

  /* =========================================================
     ELIMINAR CUENTA
     ========================================================= */

  const handleDeleteAccount = (
    account: SystemAccount
  ) => {
    const confirmed =
      window.confirm(
        `¿Seguro que deseas eliminar a ${account.username}?`
      );

    if (!confirmed) {
      return;
    }

    /*
      TODO BACKEND:

      DELETE /api/super/accounts/:id
    */

    setAccounts((prev) =>
      prev.filter(
        (item) =>
          item.id !== account.id
      )
    );

    if (account.role === 'user') {
      setUtrs((prev) =>
        prev.map((utr) =>
          utr.assigned_user_id === account.id
            ? {
                ...utr,
                assigned_user_id: null,
              }
            : utr
        )
      );
    }

    addHistory(
      'Cuenta eliminada',
      `${account.username} fue eliminado`
    );
  };

  /* =========================================================
     VER DETALLE UTR
     ========================================================= */

  const openUtrDetail = (
    utr: SystemUtr
  ) => {
    setSelectedUtr(utr);

    setShowUtrDetail(true);
  };

  /* =========================================================
     CONFIGURAR UTR
     ========================================================= */

  const openConfigureUtr = (
    utr: SystemUtr
  ) => {
    setSelectedUtr(utr);

    setUtrForm({
      client_id:
        utr.client_id
          ? String(utr.client_id)
          : '',

      status: utr.status,
    });

    setShowConfigureUtr(true);
  };

  const handleUpdateUtr = (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!selectedUtr) {
      return;
    }

    const newClientId =
      utrForm.client_id
        ? Number(utrForm.client_id)
        : null;

    const company =
      newClientId
        ? companies.find(
            (item) =>
              item.id === newClientId
          )
        : null;

    const companyChanged =
      selectedUtr.client_id !==
      newClientId;

    /*
      TODO BACKEND:

      PUT /api/super/utrs/:id

      body:

      {
        client_id,
        status
      }

      Si cambia client_id:
      assigned_user_id debe validarse.

      Si el usuario actual no pertenece
      a la nueva empresa, la asignación
      debe eliminarse.
    */

    setUtrs((prev) =>
      prev.map((utr) =>
        utr.id === selectedUtr.id
          ? {
              ...utr,

              client_id: newClientId,

              status: utrForm.status,

              is_active:
                utrForm.status === 'Activa' ||
                utrForm.status === 'Advertencia',

              assigned_user_id:
                companyChanged
                  ? null
                  : utr.assigned_user_id,
            }
          : utr
      )
    );

    addHistory(
      'UTR configurada',

      `${selectedUtr.tracking_name} ${
        company
          ? `asignada a ${company.company_name}`
          : 'sin empresa asignada'
      }`
    );

    setShowConfigureUtr(false);

    setSelectedUtr(null);
  };

  /* =========================================================
     SELECCIÓN DE UTR PARA EMPRESA
     ========================================================= */

  const toggleCompanyUtr = (
    utrId: number
  ) => {
    setCompanyUtrSelection((prev) => {
      if (prev.includes(utrId)) {
        return prev.filter(
          (id) => id !== utrId
        );
      }

      return [
        ...prev,
        utrId,
      ];
    });
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <main className="super-page">
      <div className="super-bg-grid"></div>

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="super-sidebar">
        <div className="super-brand">
          <div className="super-logo">
            <img
              src={logoTesseracto}
              alt="Logo Tesseracto"
            />
          </div>

          <div>
            <h2>Tesseracto</h2>

            <p>Control global</p>
          </div>
        </div>

        <div className="super-nav-label">
          Plataforma
        </div>

        <nav>
          <a
            href="#resumen"
            className="active"
          >
            <span></span>
            Resumen
          </a>

          <a href="#empresas">
            <span></span>
            Empresas
          </a>

          <a href="#administradores">
            <span></span>
            Administradores
          </a>

          <a href="#usuarios">
            <span></span>
            Usuarios
          </a>

          <a href="#utrs">
            <span></span>
            Inventario UTR
          </a>

          <a href="#historial">
            <span></span>
            Historial
          </a>
        </nav>

        <div className="super-session">
          <span>
            Sesión de control
          </span>

          <strong>
            {user?.username ||
              'Control global'}
          </strong>

          <small>
            Gestión de plataforma
          </small>
        </div>
      </aside>

      {/* =====================================================
          CONTENIDO
          ===================================================== */}

      <section className="super-content">
        {/* ===================================================
            HEADER
            =================================================== */}

        <header className="super-header">
          <div>
            <span className="super-kicker">
              Plataforma Tesseracto
            </span>

            <h1>
              Control global
            </h1>

            <p>
              Administra empresas, cuentas,
              inventario de UTRs y actividad
              general de la plataforma.
            </p>
          </div>

          <button
            className="super-logout-button"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <span className="super-logout-icon">
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

            <span className="super-logout-text">
              <small>Finalizar</small>

              <strong>
                Cerrar sesión
              </strong>
            </span>
          </button>
        </header>

        {/* ===================================================
            RESUMEN GLOBAL
            =================================================== */}

        <section
          id="resumen"
          className="super-overview"
        >
          <div className="super-overview-copy">
            <div className="super-platform-state">
              <span></span>

              <strong>
                Plataforma disponible
              </strong>
            </div>

            <span className="super-overview-label">
              Estado global
            </span>

            <h2>
              Una vista completa
              de la operación.
            </h2>

            <p>
              Actualmente se administran{' '}
              <strong>
                {companies.length} empresas
              </strong>
              ,{' '}
              <strong>
                {admins.length} administradores
              </strong>{' '}
              y{' '}
              <strong>
                {finalUsers.length} usuarios
              </strong>.
            </p>
          </div>

          <div className="super-overview-stats">
            <div>
              <span>Empresas</span>

              <strong>
                {companies.length}
              </strong>

              <small>
                Registradas
              </small>
            </div>

            <div>
              <span>Administradores</span>

              <strong>
                {admins.length}
              </strong>

              <small>
                Cuentas admin
              </small>
            </div>

            <div>
              <span>Usuarios</span>

              <strong>
                {finalUsers.length}
              </strong>

              <small>
                Cuentas finales
              </small>
            </div>

            <div className="active">
              <span>UTRs activas</span>

              <strong>
                {activeUtrs}
              </strong>

              <small>
                Operando
              </small>
            </div>

            <div className="warning">
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

            <div className="blocked">
              <span>Bloqueadas</span>

              <strong>
                {blockedUtrs}
              </strong>

              <small>
                Acceso detenido
              </small>
            </div>

            <div className="new">
              <span>Nuevas</span>

              <strong>
                {newUtrs}
              </strong>

              <small>
                Sin configurar
              </small>
            </div>
          </div>
        </section>

        {/* ===================================================
            EMPRESAS
            =================================================== */}

        <section
          id="empresas"
          className="super-section"
        >
          <div className="super-section-heading">
            <div>
              <span>Empresas</span>

              <h2>
                Gestión de empresas
              </h2>
            </div>

            <p>
              Registra empresas y administra
              las UTRs pertenecientes a cada una.
            </p>
          </div>

          <article className="super-data-panel">
            <div className="super-toolbar">
              <div className="super-search">
                <span>
                  Buscar empresa
                </span>

                <input
                  type="text"
                  placeholder="Nombre, RFC, correo, ubicación o ID..."
                  value={companySearch}
                  onChange={(event) =>
                    setCompanySearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <button
                className="super-primary-action"
                onClick={() => {
                  setCompanyForm({
                    company_name: '',
                    rfc: '',
                    email: '',
                    phones: '',
                    location: '',
                    status: 'Activa',
                  });

                  setCompanyUtrSelection([]);

                  setShowCreateCompany(true);
                }}
              >
                <span>+</span>

                Nueva empresa
              </button>
            </div>

            <div className="super-table-shell">
              <table className="super-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Empresa</th>
                    <th>Ubicación</th>
                    <th>Contacto</th>
                    <th>Admins</th>
                    <th>Usuarios</th>
                    <th>UTRs</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCompanies.map(
                    (company) => {
                      const companyAdmins =
                        admins.filter(
                          (account) =>
                            account.client_id ===
                            company.id
                        ).length;

                      const companyUsers =
                        finalUsers.filter(
                          (account) =>
                            account.client_id ===
                            company.id
                        ).length;

                      const companyUtrs =
                        utrs.filter(
                          (utr) =>
                            utr.client_id ===
                            company.id
                        ).length;

                      return (
                        <tr key={company.id}>
                          <td>
                            #{company.id}
                          </td>

                          <td>
                            <strong>
                              {company.company_name}
                            </strong>

                            <small>
                              {company.rfc ||
                                'Sin RFC'}
                            </small>
                          </td>

                          <td>
                            {company.location}
                          </td>

                          <td>
                            {company.email}
                          </td>

                          <td>
                            {companyAdmins}
                          </td>

                          <td>
                            {companyUsers}
                          </td>

                          <td>
                            {companyUtrs}
                          </td>

                          <td>
                            <span
                              className={`super-company-status ${company.status.toLowerCase()}`}
                            >
                              {company.status}
                            </span>
                          </td>

                          <td>
                            <div className="super-action-group">
                              <button
                                onClick={() =>
                                  openConfigureCompany(
                                    company
                                  )
                                }
                              >
                                Configurar
                              </button>

                              <button
                                className="danger"
                                onDoubleClick={() =>
                                  handleDeleteCompany(
                                    company
                                  )
                                }
                                title="Haz doble clic para eliminar la empresa"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>

              {filteredCompanies.length === 0 && (
                <div className="super-no-results">
                  No se encontraron empresas.
                </div>
              )}
            </div>
          </article>
        </section>

        {/* ===================================================
            ADMINISTRADORES
            =================================================== */}

        <section
          id="administradores"
          className="super-section"
        >
          <div className="super-section-heading">
            <div>
              <span>Administradores</span>

              <h2>
                Control de administradores
              </h2>
            </div>

            <p>
              Cada administrador tendrá acceso
              únicamente al panel de su empresa.
            </p>
          </div>

          <article className="super-data-panel">
            <div className="super-toolbar">
              <div className="super-search">
                <span>
                  Buscar administrador
                </span>

                <input
                  type="text"
                  placeholder="Usuario, empresa o ID..."
                  value={adminSearch}
                  onChange={(event) =>
                    setAdminSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <button
                className="super-primary-action"
                onClick={() => {
                  setAccountForm({
                    username: '',
                    password: '',
                    client_id: '',
                    status: 'Activo',
                  });

                  setShowCreateAdmin(true);
                }}
              >
                <span>+</span>

                Crear administrador
              </button>
            </div>

            <div className="super-table-shell">
              <table className="super-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Administrador</th>
                    <th>Empresa</th>
                    <th>Creación</th>
                    <th>Último acceso</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAdmins.map(
                    (account) => (
                      <tr key={account.id}>
                        <td>
                          #{account.id}
                        </td>

                        <td>
                          <strong>
                            {account.username}
                          </strong>
                        </td>

                        <td>
                          {getCompany(
                            account.client_id
                          )?.company_name ||
                            'Sin empresa'}
                        </td>

                        <td>
                          {account.created_at}
                        </td>

                        <td>
                          {account.last_login ||
                            'Sin registro'}
                        </td>

                        <td>
                          <span
                            className={`super-account-status ${account.status.toLowerCase()}`}
                          >
                            {account.status}
                          </span>
                        </td>

                        <td>
                          <div className="super-action-group">
                            <button
                              onClick={() =>
                                openConfigureAccount(
                                  account
                                )
                              }
                            >
                              Configurar
                            </button>

                            <button
                              className="danger"
                              onDoubleClick={() =>
                                handleDeleteAccount(
                                  account
                                )
                              }
                              title="Haz doble clic para eliminar esta cuenta"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {filteredAdmins.length === 0 && (
                <div className="super-no-results">
                  No se encontraron administradores.
                </div>
              )}
            </div>
          </article>
        </section>

        {/* ===================================================
            USUARIOS FINALES
            =================================================== */}

        <section
          id="usuarios"
          className="super-section"
        >
          <div className="super-section-heading">
            <div>
              <span>Usuarios</span>

              <h2>
                Usuarios de la plataforma
              </h2>
            </div>

            <p>
              Vista global de las cuentas finales
              creadas para cada empresa.
            </p>
          </div>

          <article className="super-data-panel">
            <div className="super-toolbar">
              <div className="super-search">
                <span>
                  Buscar usuario
                </span>

                <input
                  type="text"
                  placeholder="Usuario, empresa o ID..."
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <button
                className="super-primary-action"
                onClick={() => {
                  setAccountForm({
                    username: '',
                    password: '',
                    client_id: '',
                    status: 'Activo',
                  });

                  setShowCreateUser(true);
                }}
              >
                <span>+</span>

                Crear usuario
              </button>
            </div>

            <div className="super-table-shell">
              <table className="super-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Empresa</th>
                    <th>UTR</th>
                    <th>Creación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map(
                    (account) => {
                      const assignedUtr =
                        utrs.find(
                          (utr) =>
                            utr.assigned_user_id ===
                            account.id
                        );

                      return (
                        <tr key={account.id}>
                          <td>
                            #{account.id}
                          </td>

                          <td>
                            <strong>
                              {account.username}
                            </strong>
                          </td>

                          <td>
                            {getCompany(
                              account.client_id
                            )?.company_name ||
                              'Sin empresa'}
                          </td>

                          <td>
                            {assignedUtr?.nsut ||
                              'Sin UTR'}
                          </td>

                          <td>
                            {account.created_at}
                          </td>

                          <td>
                            <span
                              className={`super-account-status ${account.status.toLowerCase()}`}
                            >
                              {account.status}
                            </span>
                          </td>

                          <td>
                            <div className="super-action-group">
                              <button
                                onClick={() =>
                                  openConfigureAccount(
                                    account
                                  )
                                }
                              >
                                Configurar
                              </button>

                              <button
                                className="danger"
                                onDoubleClick={() =>
                                  handleDeleteAccount(
                                    account
                                  )
                                }
                                title="Haz doble clic para eliminar esta cuenta"
                              >
                                Eliminar
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
                <div className="super-no-results">
                  No se encontraron usuarios.
                </div>
              )}
            </div>
          </article>
        </section>

        {/* ===================================================
            INVENTARIO UTR
            =================================================== */}

        <section
          id="utrs"
          className="super-section"
        >
          <div className="super-section-heading">
            <div>
              <span>Inventario</span>

              <h2>
                Control global de UTRs
              </h2>
            </div>

            <p>
              Consulta el estado, empresa y usuario
              relacionados con cada equipo.
            </p>
          </div>

          <article className="super-data-panel">
            <div className="super-toolbar">
              <div className="super-search">
                <span>
                  Buscar UTR
                </span>

                <input
                  type="text"
                  placeholder="Seguimiento, NSUT, NSUE, NSM, empresa o ID..."
                  value={utrSearch}
                  onChange={(event) =>
                    setUtrSearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="super-toolbar-result">
                {filteredUtrs.length}{' '}
                {filteredUtrs.length === 1
                  ? 'equipo'
                  : 'equipos'}
              </div>
            </div>

            <div className="super-table-shell">
              <table className="super-table super-utr-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Seguimiento</th>
                    <th>NSUT</th>
                    <th>Estado</th>
                    <th>Empresa</th>
                    <th>Usuario</th>
                    <th>Actualización</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUtrs.map(
                    (utr) => (
                      <tr key={utr.id}>
                        <td>
                          #{utr.id}
                        </td>

                        <td>
                          <strong>
                            {utr.tracking_name}
                          </strong>
                        </td>

                        <td>
                          {utr.nsut}
                        </td>

                        <td>
                          <span
                            className={`super-utr-status ${utr.status.toLowerCase()}`}
                          >
                            {utr.status}
                          </span>
                        </td>

                        <td>
                          {getCompany(
                            utr.client_id
                          )?.company_name ||
                            'Sin empresa'}
                        </td>

                        <td>
                          {getAssignedUser(
                            utr.assigned_user_id
                          )?.username ||
                            'Sin asignar'}
                        </td>

                        <td>
                          {utr.actualizacion}
                        </td>

                        <td>
                          <div className="super-action-group">
                            <button
                              onClick={() =>
                                openUtrDetail(
                                  utr
                                )
                              }
                            >
                              Ver más
                            </button>

                            <button
                              onClick={() =>
                                openConfigureUtr(
                                  utr
                                )
                              }
                            >
                              Configurar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>

              {filteredUtrs.length === 0 && (
                <div className="super-no-results">
                  No se encontraron UTRs.
                </div>
              )}
            </div>
          </article>
        </section>

        {/* ===================================================
            HISTORIAL
            =================================================== */}

        <section
          id="historial"
          className="super-section"
        >
          <div className="super-section-heading">
            <div>
              <span>Historial</span>

              <h2>
                Actividad global
              </h2>
            </div>

            <p>
              Registro de cambios realizados
              sobre empresas, cuentas y equipos.
            </p>
          </div>

          <article className="super-history-panel">
            <div className="super-toolbar">
              <div className="super-search">
                <span>
                  Filtrar actividad
                </span>

                <input
                  type="text"
                  placeholder="ID, fecha, usuario, acción o detalle..."
                  value={historySearch}
                  onChange={(event) =>
                    setHistorySearch(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="super-toolbar-result">
                {filteredHistory.length}{' '}
                movimientos
              </div>
            </div>

            <div className="super-history-list">
              {filteredHistory.map(
                (item) => (
                  <article
                    key={item.id}
                    className="super-history-item"
                  >
                    <div className="super-history-marker">
                      <span></span>
                    </div>

                    <div className="super-history-content">
                      <div className="super-history-top">
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

                      <div className="super-history-meta">
                        <span>
                          {item.date}
                        </span>

                        <span>
                          Realizado por {item.actor}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              )}

              {filteredHistory.length === 0 && (
                <div className="super-no-results">
                  No se encontraron movimientos.
                </div>
              )}
            </div>
          </article>
        </section>
      </section>

      {/* =====================================================
          MODAL CREAR EMPRESA
          ===================================================== */}

      {showCreateCompany && (
        <div className="super-modal-overlay">
          <div className="super-modal super-modal-large">
            <div className="super-modal-header">
              <div>
                <span>
                  Nueva empresa
                </span>

                <h2>
                  Registrar empresa
                </h2>

                <p>
                  Registra la información de contacto
                  y selecciona las UTRs iniciales.
                </p>
              </div>

              <button
                className="super-modal-close"
                onClick={() =>
                  setShowCreateCompany(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateCompany}
            >
              <div className="super-form-grid">
                <label>
                  Nombre de la empresa

                  <input
                    type="text"
                    value={
                      companyForm.company_name
                    }
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,

                        company_name:
                          event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  RFC

                  <input
                    type="text"
                    value={companyForm.rfc}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,

                        rfc:
                          event.target.value,
                      })
                    }
                    placeholder="Opcional"
                  />
                </label>

                <label>
                  Correo electrónico

                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,

                        email:
                          event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label>
                  Teléfono o teléfonos

                  <input
                    type="text"
                    value={companyForm.phones}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,

                        phones:
                          event.target.value,
                      })
                    }
                    placeholder="222 123 4567, 222 987 6543"
                    required
                  />
                </label>

                <label className="super-form-full">
                  Ubicación

                  <input
                    type="text"
                    value={companyForm.location}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,

                        location:
                          event.target.value,
                      })
                    }
                    required
                  />
                </label>
              </div>

              <div className="super-modal-subsection">
                <span>
                  UTRs iniciales
                </span>

                <h3>
                  Asignar equipos
                </h3>

                <p>
                  Solo se muestran UTRs que todavía
                  no pertenecen a una empresa.
                </p>

                <div className="super-utr-choice-grid">
                  {utrs
                    .filter(
                      (utr) =>
                        utr.client_id === null
                    )
                    .map((utr) => (
                      <label
                        key={utr.id}
                        className="super-utr-choice"
                      >
                        <input
                          type="checkbox"
                          checked={
                            companyUtrSelection.includes(
                              utr.id
                            )
                          }
                          onChange={() =>
                            toggleCompanyUtr(
                              utr.id
                            )
                          }
                        />

                        <span>
                          <strong>
                            {utr.tracking_name}
                          </strong>

                          <small>
                            {utr.nsut} · {utr.status}
                          </small>
                        </span>
                      </label>
                    ))}

                  {utrs.filter(
                    (utr) =>
                      utr.client_id === null
                  ).length === 0 && (
                    <div className="super-no-utrs">
                      No hay UTRs libres.
                    </div>
                  )}
                </div>
              </div>

              <div className="super-modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateCompany(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  Registrar empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL CONFIGURAR EMPRESA
          ===================================================== */}

      {showConfigureCompany &&
        selectedCompany && (
          <div className="super-modal-overlay">
            <div className="super-modal super-modal-large">
              <div className="super-modal-header">
                <div>
                  <span>
                    Configuración
                  </span>

                  <h2>
                    {selectedCompany.company_name}
                  </h2>

                  <p>
                    Modifica información, estado
                    y equipos asignados.
                  </p>
                </div>

                <button
                  className="super-modal-close"
                  onClick={() =>
                    setShowConfigureCompany(false)
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleUpdateCompany}
              >
                <div className="super-form-grid">
                  <label>
                    Nombre

                    <input
                      type="text"
                      value={
                        companyForm.company_name
                      }
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,

                          company_name:
                            event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    RFC

                    <input
                      type="text"
                      value={companyForm.rfc}
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,

                          rfc:
                            event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Correo

                    <input
                      type="email"
                      value={companyForm.email}
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,

                          email:
                            event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Teléfonos

                    <input
                      type="text"
                      value={companyForm.phones}
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,

                          phones:
                            event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Ubicación

                    <input
                      type="text"
                      value={companyForm.location}
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,

                          location:
                            event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Estado

                    <select
                      value={companyForm.status}
                      onChange={(event) =>
                        setCompanyForm({
                          ...companyForm,

                          status:
                            event.target
                              .value as CompanyStatus,
                        })
                      }
                    >
                      <option value="Activa">
                        Activa
                      </option>

                      <option value="Inactiva">
                        Inactiva
                      </option>

                      <option value="Bloqueada">
                        Bloqueada
                      </option>
                    </select>
                  </label>
                </div>

                <div className="super-modal-subsection">
                  <span>
                    Inventario
                  </span>

                  <h3>
                    UTRs de la empresa
                  </h3>

                  <div className="super-utr-choice-grid">
                    {utrs
                      .filter(
                        (utr) =>
                          utr.client_id === null ||
                          utr.client_id ===
                            selectedCompany.id
                      )
                      .map((utr) => (
                        <label
                          key={utr.id}
                          className="super-utr-choice"
                        >
                          <input
                            type="checkbox"
                            checked={
                              companyUtrSelection.includes(
                                utr.id
                              )
                            }
                            onChange={() =>
                              toggleCompanyUtr(
                                utr.id
                              )
                            }
                          />

                          <span>
                            <strong>
                              {utr.tracking_name}
                            </strong>

                            <small>
                              {utr.nsut} · {utr.status}
                            </small>
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="super-modal-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfigureCompany(false)
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
          MODAL CREAR ADMIN
          ===================================================== */}

      {showCreateAdmin && (
        <div className="super-modal-overlay">
          <div className="super-modal">
            <div className="super-modal-header">
              <div>
                <span>
                  Nueva cuenta
                </span>

                <h2>
                  Crear administrador
                </h2>

                <p>
                  La cuenta tendrá acceso al panel
                  de la empresa seleccionada.
                </p>
              </div>

              <button
                className="super-modal-close"
                onClick={() =>
                  setShowCreateAdmin(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(event) =>
                handleCreateAccount(
                  event,
                  'admin'
                )
              }
            >
              <AccountForm
                accountForm={accountForm}
                setAccountForm={setAccountForm}
                companies={companies}
                passwordRequired
              />

              <div className="super-modal-actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateAdmin(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary"
                >
                  Crear administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL CREAR USUARIO
          ===================================================== */}

      {showCreateUser && (
        <div className="super-modal-overlay">
          <div className="super-modal">
            <div className="super-modal-header">
              <div>
                <span>
                  Nueva cuenta
                </span>

                <h2>
                  Crear usuario
                </h2>

                <p>
                  Crea una cuenta final y vincúlala
                  con una empresa.
                </p>
              </div>

              <button
                className="super-modal-close"
                onClick={() =>
                  setShowCreateUser(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={(event) =>
                handleCreateAccount(
                  event,
                  'user'
                )
              }
            >
              <AccountForm
                accountForm={accountForm}
                setAccountForm={setAccountForm}
                companies={companies}
                passwordRequired
              />

              <div className="super-modal-note">
                La UTR del usuario se asigna desde
                el panel administrativo de su empresa.
              </div>

              <div className="super-modal-actions">
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
          MODAL CONFIGURAR CUENTA
          ===================================================== */}

      {showConfigureAccount &&
        selectedAccount && (
          <div className="super-modal-overlay">
            <div className="super-modal">
              <div className="super-modal-header">
                <div>
                  <span>
                    Configuración
                  </span>

                  <h2>
                    {selectedAccount.username}
                  </h2>

                  <p>
                    Modifica empresa, contraseña
                    o estado de la cuenta.
                  </p>
                </div>

                <button
                  className="super-modal-close"
                  onClick={() =>
                    setShowConfigureAccount(false)
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleUpdateAccount}
              >
                <AccountForm
                  accountForm={accountForm}
                  setAccountForm={setAccountForm}
                  companies={companies}
                  passwordRequired={false}
                  showStatus
                />

                <div className="super-modal-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfigureAccount(false)
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
          MODAL CONFIGURAR UTR
          ===================================================== */}

      {showConfigureUtr &&
        selectedUtr && (
          <div className="super-modal-overlay">
            <div className="super-modal">
              <div className="super-modal-header">
                <div>
                  <span>
                    Configuración UTR
                  </span>

                  <h2>
                    {selectedUtr.tracking_name}
                  </h2>

                  <p>
                    Administra estado y empresa
                    propietaria del equipo.
                  </p>
                </div>

                <button
                  className="super-modal-close"
                  onClick={() =>
                    setShowConfigureUtr(false)
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleUpdateUtr}
              >
                <label>
                  Empresa

                  <select
                    value={utrForm.client_id}
                    onChange={(event) =>
                      setUtrForm({
                        ...utrForm,

                        client_id:
                          event.target.value,
                      })
                    }
                  >
                    <option value="">
                      Sin empresa
                    </option>

                    {companies.map(
                      (company) => (
                        <option
                          key={company.id}
                          value={company.id}
                        >
                          {company.company_name}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Estado de UTR

                  <select
                    value={utrForm.status}
                    onChange={(event) =>
                      setUtrForm({
                        ...utrForm,

                        status:
                          event.target
                            .value as UtrStatus,
                      })
                    }
                  >
                    <option value="Nueva">
                      Nueva
                    </option>

                    <option value="Activa">
                      Activa
                    </option>

                    <option value="Advertencia">
                      Advertencia
                    </option>

                    <option value="Inactiva">
                      Inactiva
                    </option>

                    <option value="Bloqueada">
                      Bloqueada
                    </option>
                  </select>
                </label>

                <div className="super-modal-note">
                  Al cambiar una UTR de empresa,
                  su usuario final será desasignado.
                </div>

                <div className="super-modal-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfigureUtr(false)
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="primary"
                  >
                    Guardar configuración
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* =====================================================
          MODAL DETALLE UTR
          ===================================================== */}

      {showUtrDetail &&
        selectedUtr && (
          <div className="super-modal-overlay">
            <div className="super-modal super-utr-detail-modal">
              <div className="super-modal-header">
                <div>
                  <span>
                    Detalle de equipo
                  </span>

                  <h2>
                    {selectedUtr.tracking_name}
                  </h2>

                  <p>
                    Información operativa y
                    telemetría disponible.
                  </p>
                </div>

                <button
                  className="super-modal-close"
                  onClick={() =>
                    setShowUtrDetail(false)
                  }
                >
                  ×
                </button>
              </div>

              <div className="super-utr-detail-summary">
                <div>
                  <span>NSUT</span>
                  <strong>{selectedUtr.nsut}</strong>
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
                  <span>Estado</span>

                  <strong>
                    {selectedUtr.status}
                  </strong>
                </div>

                <div>
                  <span>Empresa</span>

                  <strong>
                    {getCompany(
                      selectedUtr.client_id
                    )?.company_name ||
                      'Sin empresa'}
                  </strong>
                </div>

                <div>
                  <span>Usuario</span>

                  <strong>
                    {getAssignedUser(
                      selectedUtr.assigned_user_id
                    )?.username ||
                      'Sin asignar'}
                  </strong>
                </div>
              </div>

              <div className="super-utr-live-values">
                <div>
                  <span>
                    Flujo actual
                  </span>

                  <strong>
                    {selectedUtr.flujo}
                  </strong>
                </div>

                <div>
                  <span>
                    Velocidad
                  </span>

                  <strong>
                    {selectedUtr.velocidad}
                  </strong>
                </div>

                <div>
                  <span>
                    Acumulado
                  </span>

                  <strong>
                    {selectedUtr.acumulado}
                  </strong>
                </div>

                <div>
                  <span>
                    KER
                  </span>

                  <strong>
                    {selectedUtr.ker}
                  </strong>
                </div>
              </div>

              <div className="super-utr-detail-grid">
                <article>
                  <div className="super-detail-title">
                    <span>
                      Ubicación
                    </span>

                    <h3>
                      Mapa del equipo
                    </h3>
                  </div>

                  <UserMap
                    utrs={[selectedUtr]}
                  />
                </article>

                <article>
                  <div className="super-detail-title">
                    <span>
                      Telemetría
                    </span>

                    <h3>
                      Histórico
                    </h3>
                  </div>

                  <TelemetryChart
                    data={utrTelemetryData}
                  />
                </article>
              </div>
            </div>
          </div>
        )}
    </main>
  );
};

/* =========================================================
   FORMULARIO REUTILIZABLE DE CUENTA
   ========================================================= */

interface AccountFormProps {
  accountForm: {
    username: string;
    password: string;
    client_id: string;
    status: AccountStatus;
  };

  setAccountForm: React.Dispatch<
    React.SetStateAction<{
      username: string;
      password: string;
      client_id: string;
      status: AccountStatus;
    }>
  >;

  companies: Company[];

  passwordRequired: boolean;

  showStatus?: boolean;
}

const AccountForm = ({
  accountForm,
  setAccountForm,
  companies,
  passwordRequired,
  showStatus = false,
}: AccountFormProps) => {
  return (
    <>
      <label>
        Nombre de usuario

        <input
          type="text"
          value={accountForm.username}
          onChange={(event) =>
            setAccountForm({
              ...accountForm,

              username:
                event.target.value,
            })
          }
          required
        />
      </label>

      <label>
        {passwordRequired
          ? 'Contraseña'
          : 'Nueva contraseña'}

        <input
          type="password"
          value={accountForm.password}
          onChange={(event) =>
            setAccountForm({
              ...accountForm,

              password:
                event.target.value,
            })
          }
          placeholder={
            passwordRequired
              ? 'Contraseña de acceso'
              : 'Dejar vacío para conservarla'
          }
          required={passwordRequired}
        />
      </label>

      <label>
        Empresa

        <select
          value={accountForm.client_id}
          onChange={(event) =>
            setAccountForm({
              ...accountForm,

              client_id:
                event.target.value,
            })
          }
          required
        >
          <option value="">
            Selecciona una empresa
          </option>

          {companies.map((company) => (
            <option
              key={company.id}
              value={company.id}
            >
              {company.company_name}
            </option>
          ))}
        </select>
      </label>

      {showStatus && (
        <label>
          Estado de cuenta

          <select
            value={accountForm.status}
            onChange={(event) =>
              setAccountForm({
                ...accountForm,

                status:
                  event.target
                    .value as AccountStatus,
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
      )}
    </>
  );
};