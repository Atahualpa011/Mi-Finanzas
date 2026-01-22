// --- Componente Layout: envuelve el contenido principal y aplica estilos globales ---
export default function Layout({ children, withSidebar = true }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-secondary)",
        marginLeft: withSidebar ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)',
        marginTop: 'var(--navbar-height)',
        transition: "margin var(--transition-base)",
        paddingTop: 'var(--spacing-lg)'
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          padding: "var(--spacing-xl) var(--spacing-lg)",
          background: "var(--bg-primary)",
          borderRadius: 'var(--radius-lg)',
          minHeight: "80vh",
          boxShadow: "var(--shadow-sm)",
          boxSizing: "border-box",
        }}
      >
        {/* Renderiza el contenido de la página */}
        {children}
      </div>
    </div>
  );
}