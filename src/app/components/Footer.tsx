export default function Footer() {
  return (
    <footer style={{ padding: '30px 40px', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        &copy; {new Date().getFullYear()} My Purchases. All rights tracked.
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <a href="#">Export Data</a>
        <a href="#">Support</a>
        <a href="#">Privacy</a>
      </div>
    </footer>
  )
}