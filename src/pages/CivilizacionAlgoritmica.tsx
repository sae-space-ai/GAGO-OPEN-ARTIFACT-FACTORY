import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ca';

export default function CivilizacionAlgoritmica() {
  return (
    <div className="min-h-screen bg-[var(--ca-color-bg-primary)] text-[var(--ca-color-text-primary)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--ca-color-bg-primary)] via-[var(--ca-color-bg-secondary)] to-[var(--ca-color-bg-primary)]"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(var(--ca-color-accent-primary) 1px, transparent 1px),
                             linear-gradient(90deg, var(--ca-color-accent-primary) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center">
            {/* Logo/Brand */}
            <div className="mb-8 inline-block">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--ca-color-accent-primary)] to-[var(--ca-color-accent-secondary)] flex items-center justify-center text-4xl font-bold text-[var(--ca-color-text-inverse)] shadow-2xl">
                CA
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'var(--ca-font-serif)' }}>
              <span className="bg-gradient-to-r from-[var(--ca-color-accent-primary)] to-[var(--ca-color-accent-secondary)] bg-clip-text text-transparent">
                Civilización
              </span>
              <br />
              <span className="text-[var(--ca-color-text-primary)]">
                Algorítmica
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-[var(--ca-color-text-secondary)] mb-4 max-w-3xl mx-auto">
              El futuro no se predice. Se construye.
            </p>

            {/* Description */}
            <p className="text-lg text-[var(--ca-color-text-tertiary)] mb-12 max-w-2xl mx-auto">
              Plataforma europea de inteligencia artificial responsable con soberanía tecnológica, 
              transparencia y supervisión humana.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard">
                <Button variant="primary" size="lg">
                  Acceder al Centro de Mando
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="secondary" size="lg">
                  Explorar Proyectos
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-[var(--ca-color-accent-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-[var(--ca-color-accent-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-[var(--ca-color-bg-secondary)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--ca-font-serif)' }}>
              Valores Fundamentales
            </h2>
            <p className="text-lg text-[var(--ca-color-text-secondary)]">
              Principios que guían nuestra plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Inteligencia Responsable',
                description: 'Sistemas de IA diseñados con ética, transparencia y supervisión humana.',
                icon: '🧠'
              },
              {
                title: 'Soberanía Tecnológica',
                description: 'Control total sobre tus datos, modelos y procesos de decisión.',
                icon: '🛡️'
              },
              {
                title: 'Transparencia',
                description: 'Trazabilidad completa de cada decisión y operación del sistema.',
                icon: '🔍'
              },
              {
                title: 'Verificación',
                description: 'Validación independiente de resultados y calidad del código.',
                icon: '✓'
              },
              {
                title: 'Apertura',
                description: 'Arquitectura abierta, portable y extensible por diseño.',
                icon: '🌐'
              },
              {
                title: 'Sostenibilidad',
                description: 'Optimización de recursos y presupuesto cero por defecto.',
                icon: '🌱'
              }
            ].map((feature, index) => (
              <div key={index} className="ca-card hover:border-[var(--ca-color-accent-primary)] transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-[var(--ca-color-text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-[var(--ca-color-text-secondary)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 bg-[var(--ca-color-bg-primary)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--ca-font-serif)' }}>
              Arquitectura del Ecosistema
            </h2>
            <p className="text-lg text-[var(--ca-color-text-secondary)]">
              Motor cognitivo JOULE integrado en cada capa del sistema
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual representation */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto relative">
                {/* Central core */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--ca-color-accent-primary)] to-[var(--ca-color-accent-secondary)] flex items-center justify-center text-2xl font-bold text-[var(--ca-color-text-inverse)] shadow-2xl">
                    JOULE
                  </div>
                </div>

                {/* Orbital rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border-2 border-[var(--ca-color-accent-primary)] opacity-20 animate-spin" style={{ animationDuration: '20s' }}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-80 h-80 rounded-full border-2 border-[var(--ca-color-accent-secondary)] opacity-20 animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-96 h-96 rounded-full border-2 border-[var(--ca-color-accent-tertiary)] opacity-20 animate-spin" style={{ animationDuration: '40s' }}></div>
                </div>

                {/* Orbiting nodes */}
                {['IA', 'API', 'QA', 'ML'].map((label, index) => {
                  const angle = (index * 90) * (Math.PI / 180);
                  const radius = 160;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  return (
                    <div
                      key={label}
                      className="absolute w-12 h-12 rounded-full bg-[var(--ca-color-bg-elevated)] border-2 border-[var(--ca-color-accent-primary)] flex items-center justify-center text-xs font-bold"
                      style={{
                        left: `calc(50% + ${x}px - 24px)`,
                        top: `calc(50% + ${y}px - 24px)`
                      }}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="space-y-6">
                {[
                  {
                    title: 'Motor Cognitivo JOULE',
                    description: 'Sistema de optimización y verificación que coordina todos los componentes del ecosistema.'
                  },
                  {
                    title: '15 Agentes Especializados',
                    description: 'Equipo multiagente para entrenamiento, evaluación y mejora continua del sistema.'
                  },
                  {
                    title: 'Verificación Independiente',
                    description: 'Validación automática de código con detección de errores matemáticos y lógicos.'
                  },
                  {
                    title: 'Gestión de Proveedores',
                    description: 'Integración con múltiples proveedores de IA: OpenRouter, Ollama local, y más.'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--ca-color-accent-primary)] flex items-center justify-center text-[var(--ca-color-text-inverse)] font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-[var(--ca-color-text-primary)]">
                        {item.title}
                      </h3>
                      <p className="text-[var(--ca-color-text-secondary)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-[var(--ca-color-bg-secondary)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '12', label: 'Fases Completadas' },
              { value: '74+', label: 'Módulos Implementados' },
              { value: '250+', label: 'Pruebas Unitarias' },
              { value: '100%', label: 'Código Abierto' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-[var(--ca-color-accent-primary)] to-[var(--ca-color-accent-secondary)] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-[var(--ca-color-text-secondary)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[var(--ca-color-bg-primary)] to-[var(--ca-color-bg-secondary)]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'var(--ca-font-serif)' }}>
            Comienza a Construir el Futuro
          </h2>
          <p className="text-xl text-[var(--ca-color-text-secondary)] mb-12">
            Accede a una plataforma completa de desarrollo de software asistido por inteligencia artificial
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button variant="primary" size="lg">
                Ir al Dashboard
              </Button>
            </Link>
            <Link to="/tools">
              <Button variant="secondary" size="lg">
                Explorar Herramientas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--ca-color-bg-primary)] border-t border-[var(--ca-color-border)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--ca-color-accent-primary)] to-[var(--ca-color-accent-secondary)] flex items-center justify-center font-bold text-[var(--ca-color-text-inverse)]">
                  CA
                </div>
                <div>
                  <div className="font-bold text-[var(--ca-color-text-primary)]">Civilización Algorítmica</div>
                  <div className="text-xs text-[var(--ca-color-text-tertiary)]">GAGO Open Artifact Factory</div>
                </div>
              </div>
              <p className="text-sm text-[var(--ca-color-text-secondary)]">
                Plataforma europea de inteligencia artificial responsable
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-[var(--ca-color-text-primary)]">Enlaces</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/dashboard" className="text-[var(--ca-color-text-secondary)] hover:text-[var(--ca-color-accent-primary)] transition-colors">Dashboard</Link></li>
                <li><Link to="/projects" className="text-[var(--ca-color-text-secondary)] hover:text-[var(--ca-color-accent-primary)] transition-colors">Proyectos</Link></li>
                <li><Link to="/tools" className="text-[var(--ca-color-text-secondary)] hover:text-[var(--ca-color-accent-primary)] transition-colors">Herramientas</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-[var(--ca-color-text-primary)]">Recursos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/docs" className="text-[var(--ca-color-text-secondary)] hover:text-[var(--ca-color-accent-primary)] transition-colors">Documentación</Link></li>
                <li><Link to="/settings" className="text-[var(--ca-color-text-secondary)] hover:text-[var(--ca-color-accent-primary)] transition-colors">Configuración</Link></li>
                <li><Link to="/joule" className="text-[var(--ca-color-text-secondary)] hover:text-[var(--ca-color-accent-primary)] transition-colors">JOULE Engine</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--ca-color-border)] text-center text-sm text-[var(--ca-color-text-tertiary)]">
            <p>© 2024 GAGO Open Artifact Factory. Licencia MIT.</p>
            <p className="mt-2">Versión 12.1.0 - Fase 12.1 Certificada</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
