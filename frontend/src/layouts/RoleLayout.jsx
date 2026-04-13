import { Link, Outlet } from 'react-router-dom';

function RoleLayout({ title, links }) {
  return (
    <main className="p-6">
      <h1>{title}</h1>
      <nav style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '12px 0 20px' }}>
        {links.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </nav>
      <Outlet />
    </main>
  );
}

export default RoleLayout;
