import { useState } from 'react';
import '../styles/HelpButton.css';

/**
 * Componente que muestra un botón de ayuda y un modal con la guía de uso
 * @param {string} section - La sección de la app (dashboard, movements, friends, etc.)
 * @param {object} helpContent - Objeto con title y content para el modal
 */
export default function HelpButton({ section, helpContent }) {
  const [showModal, setShowModal] = useState(false);

  if (!helpContent) return null;

  return (
    <>
      {/* Botón de ayuda */}
      <button
        onClick={() => setShowModal(true)}
        className="help-button"
        title="Ver guía de uso"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          boxShadow: 'var(--shadow-sm)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--primary-dark)';
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--primary)';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        <i className="bi bi-question-circle-fill"></i>
        <span>¿Qué puedo hacer?</span>
      </button>

      {/* Modal de ayuda */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)'
            }}>
              {/* Header */}
              <div className="modal-header" style={{
                borderBottom: '2px solid var(--primary)',
                padding: '1.5rem'
              }}>
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: 'var(--primary)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-book" style={{
                      fontSize: '1.5rem',
                      color: 'white'
                    }}></i>
                  </div>
                  <div>
                    <h5 className="modal-title m-0" style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'var(--text-primary)'
                    }}>
                      {helpContent.title}
                    </h5>
                    <p className="m-0 mt-1" style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      Guía de uso y funcionalidades
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Cerrar"
                  style={{
                    filter: 'var(--bs-btn-close-color)'
                  }}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body" style={{
                padding: '2rem',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}>
                <div 
                  className="help-content"
                  dangerouslySetInnerHTML={{ __html: helpContent.content }}
                  style={{
                    color: 'var(--text-primary)',
                    lineHeight: '1.8'
                  }}
                />
              </div>

              {/* Footer */}
              <div className="modal-footer" style={{
                borderTop: '1px solid var(--border-light)',
                padding: '1rem 1.5rem'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.5rem 1.5rem',
                    fontWeight: '500'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
