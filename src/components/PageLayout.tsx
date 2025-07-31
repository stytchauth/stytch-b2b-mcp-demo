import './Login.css';

interface PageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, subtitle, children }: PageLayoutProps) {
  return (
    <div className="centered-login">
      <div className="login-container">
        <div className="notion-header">
          <h1 className="notion-title">{title}</h1>
          <p className="notion-subtitle">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
} 