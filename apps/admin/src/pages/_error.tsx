import type { NextPageContext } from 'next';

function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>{statusCode}</h1>
      <p style={{ marginTop: '16px', color: '#9CA3AF' }}>
        {statusCode === 404 ? 'Page introuvable' : 'Erreur interne'}
      </p>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
