// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { PageHeader, Card } from '../components';

export function NotFoundPage() {
  return (
    <div>
      <PageHeader title="404" subtitle="The page you were looking for does not exist" />
      <Card title="Page Not Found" subtitle="We looked everywhere">
        <div className="empty-state">
          <h3>Nothing here</h3>
          <p>The route you entered is not part of this dApp.</p>
          <Link to="/chain-info" className="btn btn-primary">Go to Chain Info</Link>
        </div>
      </Card>
    </div>
  );
}