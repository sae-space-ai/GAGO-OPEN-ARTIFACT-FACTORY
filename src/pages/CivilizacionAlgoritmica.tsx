import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Activity, BrainCircuit, Cpu, Layers3,
  Network, ShieldCheck, Workflow, FolderKanban, Sparkles,
  ScanLine, Database, Fingerprint, Radio, Box, ChevronRight,
  Command, BookOpen, Gauge, CircleDot
} from 'lucide-react';
import { useData } from '../context/DataContext';
import '../styles/civilizacion-algoritmica.css';

const domains = [
  {
    id: '01', eyebrow: 'EL NÚCLEO', title: 'Inteligencia que aprende',
    description: 'Modelos, evaluación cognitiva y conocimiento sometido a evidencia.',
    Icon: BrainCircuit, href: '/joule-cognitive', tag: 'JOULE Cognitive', accent: 'violet'
  },
  {
    id: '02', eyebrow: 'LA ENERGÍA', title: 'Optimización responsable',
    description: 'Recursos, decisiones y mediciones. Ningún ahorro sin demostrar.',
    Icon: Gauge, href: '/joule', tag: 'JOULE Engine', accent: 'cyan'
  },
  {
    id: '03', eyebrow: 'LA CREACIÓN', title: 'Factoría de artefactos',
    description: 'Ideas que se convierten en herramientas, código y proyectos.',
    Icon: Layers3, href: '/tools', tag: 'Tool Factory', accent: 'amber'
  },
  {
    id: '04', eyebrow: 'LA CONFIANZA', title: 'Gobernanza verificable',
    description: 'Pruebas, controles, aprobación humana y trazabilidad.',
    Icon: ShieldCheck, href: '/gates', tag: 'Quality Gates', accent: 'mint'
  },
  {
    id: '05', eyebrow: 'LOS AGENTES', title: 'Inteligencia coordinada',
    description: 'Colaboración entre capacidades, bajo límites operativos.',
    Icon: Network, href: '/training', tag: 'Training Center', accent: 'rose'
  },
  {
    id: '06', eyebrow: 'LA INFRAESTRUCTURA', title: 'Soberanía tecnológica',
    description: 'Proveedores sustituibles, conexiones controladas y portabilidad.',
    Icon: Cpu, href: '/ai-providers', tag: 'AI Providers', accent: 'blue'
  },
] as const;

const pathways = [
  { number: '01', label: 'Pensar', detail: 'Convertir una idea en requisitos', to: '/scope', Icon: ScanLine },
  { number: '02', label: 'Construir', detail: 'Crear proyectos y artefactos', to: '/projects', Icon: Box },
  { number: '03', label: 'Comprobar', detail: 'Contrastar resultados y evidencias', to: '/evidence', Icon: Fingerprint },
  { number: '04', label: 'Decidir', detail: 'Supervisión y aprobación humana', to: '/approval', Icon: ShieldCheck },
] as const;

export default function CivilizacionAlgoritmica() {
  const { store } = useData();
  const projects = store.projects.filter(p => !p.archived).length;
  const pending = store.tasks.filter(t => ['pending', 'in_progress', 'review', 'blocked'].includes(t.status)).length;
  const proofs = store.evidence.filter(e => e.status === 'verified').length;
  const tools = store.tools?.length ?? 0;
  const jouleMode = store.jouleState?.enabled ? store.jouleState.mode : 'disabled';
  const operations = store.jouleState?.measurements?.length ?? 0;
  const jouleLabel = jouleMode === 'shadow' ? 'OBSERVACIÓN' :
    jouleMode === 'canary' ? 'CANARY' :
    jouleMode === 'active' ? 'ACTIVO' : 'DESACTIVADO';

  return (
    <div className="ca" aria-label="Civilización Algorítmica, portal de acceso a la factoría">
      <div className="ca-grain" aria-hidden="true" />
      <div className="ca-topline">
        <Link to="/civilizacion-algoritmica" className="ca-signature" aria-label="Civilización Algorítmica, inicio">
          <span className="ca-signature-symbol"><CircleDot size={19} strokeWidth={1.5} /></span>
          <span>CIVILIZACIÓN <em>ALGORÍTMICA</em></span>
        </Link>
        <div className="ca-topline-right">
          <span className="ca-top-index">GAGO OPEN ARTIFACT FACTORY</span>
          <span className="ca-status" title="La interfaz usa el estado de datos local de esta sesión">
            <span className="ca-live-dot" /> PORTAL CONECTADO AL ESTADO LOCAL
          </span>
        </div>
      </div>

      <section className="ca-hero">
        <div className="ca-hero-copy">
          <p className="ca-kicker"><span className="ca-kicker-line" /> MANIFIESTO PARA UNA NUEVA ÉPOCA <span className="ca-kicker-n">/ 01</span></p>
          <h1>El futuro no se<br /><span>predice.</span><br /><strong>Se construye.</strong></h1>
          <p className="ca-hero-intro">
            Una civilización en la que la inteligencia, el conocimiento y la tecnología
            se encuentran bajo una misma responsabilidad: <b>la humana.</b>
          </p>
          <div className="ca-hero-actions">
            <Link className="ca-primary-button" to="/projects"><span>Explorar la factoría</span><ArrowUpRight size={18}/></Link>
            <Link className="ca-secondary-button" to="/joule-cognitive">Conocer JOULE <ArrowRight size={17}/></Link>
          </div>
          <div className="ca-hero-foot"><span>01 / 06</span><span className="ca-foot-line"/><span>INTELIGENCIA · SOBERANÍA · EVIDENCIA</span></div>
        </div>
        <div className="ca-hero-art" role="img" aria-label="Visualización abstracta del núcleo de inteligencia rodeado por órbitas y conexiones">
          <div className="ca-art-halo"/>
          <div className="ca-art-orbit ca-art-orbit-one"/>
          <div className="ca-art-orbit ca-art-orbit-two"/>
          <div className="ca-art-orbit ca-art-orbit-three"/>
          <div className="ca-art-line ca-art-line-one"/>
          <div className="ca-art-line ca-art-line-two"/>
          <div className="ca-art-node ca-art-node-one"/>
          <div className="ca-art-node ca-art-node-two"/>
          <div className="ca-art-node ca-art-node-three"/>
          <div className="ca-art-core">
            <span className="ca-core-glow"/>
            <BrainCircuit size={64} strokeWidth={1.05} aria-hidden="true"/>
            <span className="ca-core-name">JOULE</span>
            <span className="ca-core-desc">COGNITIVE ENGINE</span>
          </div>
          <span className="ca-art-label ca-art-label-left">COGNICIÓN <i>001</i></span>
          <span className="ca-art-label ca-art-label-right">GOBERNANZA <i>006</i></span>
          <span className="ca-art-coord">41°  ·  SISTEMA ABIERTO  ·  V. 12</span>
          <div className="ca-art-corner ca-art-corner-a"/>
          <div className="ca-art-corner ca-art-corner-b"/>
        </div>
      </section>

      <section className="ca-live-strip" aria-label="Indicadores actuales de esta factoría">
        <div className="ca-strip-intro"><Activity size={15} strokeWidth={1.8}/><span>ESTADO REAL<br/>DEL SISTEMA</span></div>
        <Link to="/projects" className="ca-strip-stat"><strong>{projects}</strong><span>Proyectos<br/>no archivados</span></Link>
        <Link to="/tasks" className="ca-strip-stat"><strong>{pending}</strong><span>Tareas<br/>abiertas</span></Link>
        <Link to="/tools" className="ca-strip-stat"><strong>{tools}</strong><span>Herramientas<br/>registradas</span></Link>
        <Link to="/evidence" className="ca-strip-stat"><strong>{proofs}</strong><span>Evidencias<br/>verificadas</span></Link>
        <Link to="/joule" className="ca-strip-stat ca-strip-joule"><span className="ca-strip-pill">{jouleLabel}</span><span>JOULE<br/>{operations} mediciones</span></Link>
      </section>

      <section className="ca-section ca-systems" aria-labelledby="ca-systems-heading">
        <div className="ca-section-heading">
          <div><p className="ca-kicker">CAPACIDADES / 02</p><h2 id="ca-systems-heading">Una arquitectura.<br/><em>Infinitas posibilidades.</em></h2></div>
          <p>Seis ámbitos conectados entre sí. Cada uno conduce a un módulo existente y conserva sus permisos, estados y controles propios.</p>
        </div>
        <div className="ca-domain-grid">
          {domains.map(({id,eyebrow,title,description,Icon,href,tag,accent})=>(
            <Link key={id} to={href} className={'ca-domain ca-domain-'+accent} aria-label={'Abrir '+tag}>
              <span className="ca-domain-meta"><span>{id} / 06</span><ArrowUpRight size={18}/></span>
              <span className="ca-domain-icon"><Icon size={27} strokeWidth={1.35}/></span>
              <span className="ca-domain-eyebrow">{eyebrow}</span>
              <strong>{title}</strong>
              <span className="ca-domain-description">{description}</span>
              <span className="ca-domain-link">{tag}<ChevronRight size={15}/></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ca-manifesto" aria-labelledby="ca-manifesto-heading">
        <div className="ca-manifesto-number">03 <span>/ UNA DECLARACIÓN DE PRINCIPIOS</span></div>
        <div className="ca-manifesto-content">
          <span className="ca-quote-mark">“</span>
          <h2 id="ca-manifesto-heading">La verdadera innovación no consiste en automatizarlo todo, sino en <em>saber qué debe permanecer bajo control humano.</em></h2>
          <div className="ca-manifesto-meta"><span>UNA VISIÓN PARA LA CIVILIZACIÓN ALGORÍTMICA</span><Link to="/gates">Explorar las garantías <ArrowUpRight size={15}/></Link></div>
        </div>
      </section>

      <section className="ca-section ca-method" aria-labelledby="ca-method-heading">
        <div className="ca-section-heading">
          <div><p className="ca-kicker">EL MÉTODO / 04</p><h2 id="ca-method-heading">Del pensamiento<br/><em>a la evidencia.</em></h2></div>
          <p>No basta con generar una respuesta. La factoría separa planificación, ejecución, verificación y aprobación.</p>
        </div>
        <div className="ca-paths">
          {pathways.map(({number,label,detail,to,Icon})=>(
            <Link to={to} key={number} className="ca-path">
              <span className="ca-path-number">{number}</span>
              <Icon size={23} strokeWidth={1.3}/>
              <strong>{label}</strong>
              <span>{detail}</span>
              <ArrowUpRight size={17} className="ca-path-arrow"/>
            </Link>
          ))}
        </div>
      </section>

      <section className="ca-bottom-cta">
        <div className="ca-bottom-spark"><Sparkles size={30} strokeWidth={1.1}/></div>
        <div>
          <p className="ca-kicker">EL SIGUIENTE CAPÍTULO / 05</p>
          <h2>Una factoría abierta.<br/><span>Una inteligencia responsable.</span></h2>
          <p>La tecnología puede evolucionar. Los principios de trazabilidad, calidad y supervisión permanecen.</p>
        </div>
        <div className="ca-bottom-links">
          <Link to="/dashboard" className="ca-primary-button">Entrar al centro de mando <ArrowUpRight size={18}/></Link>
          <Link to="/scope" className="ca-text-link">Ver la matriz de alcance <ArrowRight size={17}/></Link>
        </div>
      </section>

      <footer className="ca-footer">
        <span><Command size={15}/> CIVILIZACIÓN ALGORÍTMICA</span>
        <span>INTERFAZ CONCEPTUAL PROPIA · REACT + VITE</span>
        <Link to="/evidence"><Database size={14}/> EVIDENCIAS</Link>
      </footer>
    </div>
  );
}
