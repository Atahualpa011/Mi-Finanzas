// --- Componente Layout: envuelve el contenido principal y aplica estilos globales ---
export default function Layout({ children, withSidebar = true }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#3c4046ff",
        marginLeft: withSidebar ? 220 : 0, // Deja espacio para el sidebar si está activo
        transition: "margin 0.2s",
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          padding: "32px 24px",
          background: "#fff",
          borderRadius: 16,
          minHeight: "80vh",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0)",
          boxSizing: "border-box",
        }}
      >
        {/* Renderiza el contenido de la página */}
        {children}
      </div>
    </div>
  );
}