import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { login } from '@/app/actions'

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const sp = await searchParams;
  const error = sp?.error

  return (
    <>
      <Header />
      <div className="main-container" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '60vh' }}>
        <h1 className="page-title" style={{ fontSize: '24px' }}>Admin Login</h1>
        
        <form action={login} className="admin-form" style={{ width: '100%', maxWidth: '400px' }}>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <label>Password</label>
            <input type="password" name="password" required placeholder="Enter admin password" />
            <button type="submit">Login</button>
        </form>
      </div>
      <Footer />
    </>
  )
}
