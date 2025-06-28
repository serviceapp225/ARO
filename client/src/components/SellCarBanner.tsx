export function SellCarBanner() {
  const handleClick = () => {
    console.log('КЛИК РАБОТАЕТ! Переход на /sell');
    window.location.href = '/sell';
  };

  return (
    <div 
      onClick={handleClick}
      style={{
        background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
        borderRadius: '12px',
        padding: '32px',
        color: 'white',
        marginBottom: '32px',
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
          🚗 Продайте свой автомобиль
        </h2>
        <p style={{ fontSize: '20px', marginBottom: '24px', opacity: 0.9 }}>
          Получите лучшую цену на нашем аукционе
        </p>
        <div style={{
          background: 'white',
          color: '#2563eb',
          display: 'inline-block',
          padding: '16px 32px',
          borderRadius: '8px',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          НАЧАТЬ ПРОДАЖУ →
        </div>
      </div>
    </div>
  );
}